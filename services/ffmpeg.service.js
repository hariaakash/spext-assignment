const _ = require('lodash');
const async = require('async');
const fse = require('fs-extra');
const mime = require('mime-types');
const { nanoid } = require('nanoid');
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
const download = require('download');

const s3 = require('../utils/s3.client');

module.exports = {
  name: 'ffmpeg',
  methods: {
    convert: {
      async handler({
        name, ext, from, to,
      }) {
        try {
          const ffmpeg = createFFmpeg();
          await ffmpeg.load();
          // WIP Update Progress
          // ffmpeg.setProgress(({ ratio }) => {
          //   const percent = _.round(ratio * 100, 2);
          //   const reqData = {
          //     name,
          //     process: 'convert',
          //     from: 'started',
          //     to: percent === 100 ? 'completed' : 'started',
          //     progress: percent,
          //     ext,
          //   };
          //   this.broker.call('media.process-status', reqData);
          //   console.log(name, ratio, percent);
          // });
          ffmpeg.FS('writeFile', from.name, await fetchFile(from.fullPath));
          await ffmpeg.run('-i', from.name, to.name);
          await fse.promises.writeFile(to.fullPath, ffmpeg.FS('readFile', to.name));
        } catch (err) {
          const error = JSON.stringify(err, Object.getOwnPropertyNames(err));
          await this.actions['process-status']({
            name,
            ext,
            process: 'convert',
            from: 'started',
            to: 'error',
            error,
          });
        }
      },
    },
  },
  events: {
    'ffmpeg.convert': {
      async handler(ctx) {
        // params: { user, name, fromExt, ext }
        await async.auto({
          fetchFile: async () => {
            const uri = await ctx.call('common.constructUri', { ..._.pick(ctx.params, ['user', 'name']), ext: ctx.params.fromExt });
            const res = await s3.get(uri);
            const fileName = nanoid();
            const fullName = `${fileName}.${ctx.params.fromExt}`;
            await download(res, '/tmp', { filename: fullName });
            return { fileName, fullName };
          },
          startProcess: async () => {
            await ctx.call('media.process-status', {
              ..._.pick(ctx.params, ['user', 'name']),
              process: 'convert',
              from: 'pending',
              to: 'started',
              ext: ctx.params.ext,
            });
          },
          convert: [
            'fetchFile',
            'startProcess',
            async (res) => {
              const { fileName, fullName } = res.fetchFile;
              const from = { fullPath: `/tmp/${fullName}`, name: fullName };
              const toName = `${fileName}.${ctx.params.ext}`;
              const to = { fullPath: `/tmp/${toName}`, name: toName };
              await this.convert({ ..._.pick(ctx.params, ['name', 'ext']), from, to });
              return { from, to };
            },
          ],
          uploadFile: [
            'convert',
            async (res) => {
              const uri = await ctx.call('common.constructUri', { ..._.pick(ctx.params, ['user', 'name', 'ext']) });
              const fileStream = fse.createReadStream(res.convert.to.fullPath);
              const { size } = await fse.stat(res.convert.to.fullPath);
              await s3.putObject(uri, {
                stream: fileStream,
                meta: { 'Content-Type': mime.lookup(ctx.params.ext) },
                size,
              });
              await ctx.call('media.addExt', { ..._.pick(ctx.params, ['user', 'name', 'ext']) });
            },
          ],
          cleanUp: [
            'uploadFile',
            async (res) => {
              await Promise.all([
                await fse.remove(res.convert.from.fullPath),
                await fse.remove(res.convert.to.fullPath),
              ]);
            },
          ],
        });
      },
    },
  },
};
