const _ = require('lodash');
const async = require('async');
const Joi = require('joi');
const { MoleculerClientError } = require('moleculer').Errors;
const { nanoid } = require('nanoid');
const fse = require('fs-extra');

const DbMixin = require('../mixins/mongo.adapter');
const FFMPEGMixin = require('../mixins/ffmpeg.mixin');
const model = require('../models/Media');
const s3 = require('../utils/s3.client');

const environment = process.env.NODE_ENV || 'development';

module.exports = {
  name: 'media',
  mixins: [
    DbMixin(model),
    FFMPEGMixin,
  ],
  settings: {
    fields: ['_id', 'name', 'codecType', 'codecName', 'duration', 'rawInfo', 'formats', 'processes', 'status'],
  },
  actions: {
    paginatedList: {
      params: () => Joi.object().keys({
        page: Joi.number().default(1),
        pageSize: Joi.number().default(10),
        sort: Joi.string().default(''),
        search: Joi.string().default(''),
        searchFields: Joi.string().default(''),
      }).min(1),
      async handler(ctx) {
        const entity = await this.actions.list({ ...ctx.params });
        return entity;
      },
    },
    get: {
      params: () => Joi.object().keys({
        name: Joi.string().required(),
      }),
      async handler(ctx) {
        const entity = await this.adapter.model.findOne({ name: ctx.params.name });
        if (!entity) throw new MoleculerClientError('Media not found', 404, 'NOT_FOUND');

        return entity;
      },
    },
    upload: {
      params: () => Joi.object().keys({
        name: Joi.string().required(),
        stream: Joi.any().required(),
        mimetype: Joi.string().required(),
      }),
      async handler(ctx) {
        // Check if media with name already exists, if exists throw error
        const check = await this.adapter.model.findOne({ name: ctx.params.name });
        if (check) throw new MoleculerClientError('Media with name already exists', 422, 'CLIENT_VALIDATION');

        ctx.emit('media.handle', { ...ctx.params });

        return { message: 'File processing in progress' };
      },
    },
    'process-status': {
      params: () => Joi.object().keys({
        name: Joi.string().required(),
        process: Joi.string().required(),
        from: Joi.string().required(),
        to: Joi.string().required(),
        progress: Joi.number(),
        error: Joi.string(),
      }),
      async handler(ctx) {
        const query = {
          name: ctx.params.name,
          'processes.action': ctx.params.process,
          'processes.status': ctx.params.from,
        };
        const updates = {
          'processes.$.status': ctx.params.to,
          'processes.$.updatedAt': Date.now(),
        };
        if (ctx.params.progress) updates['processes.$.progress'] = ctx.params.progress;
        if (ctx.params.error) updates['processes.$.error'] = ctx.params.error;
        await this.adapter.model.updateOne(query, updates);
      },
    },
  },
  methods: {
    'entity-assert': {
      async handler(ctx) {
        const query = { ..._.pick(ctx.params, ['entity', 'entityId']) };
        ctx.locals.file = await this.adapter.model.findOne(query);
        if (!ctx.locals.file) ctx.locals.file = await this.adapter.insert(query);
      },
    },
    constructUri({ name, ext }) {
      const uri = `${environment}/${name}.${ext}`;
      return uri;
    },
  },
  events: {
    'media.handle': {
      async handler(ctx) {
        // params: { name, stream, mimetype }

        await async.auto({
          // 1. Create DB entity
          createEntity: async () => {
            const process = { action: 'upload' };
            const res = await this.adapter.insert({
              name: ctx.params.name,
              processes: [process],
            });
            return res;
          },
          // 2. Store File Locally
          storeFileLocally: async () => {
            const { stream } = ctx.params;
            const path = `/tmp/${nanoid()}`;

            // Store file in /tmp from stream
            await new Promise((resolve, reject) => {
              stream
                .on('error', (error) => {
                  if (stream.truncated) fse.unlinkSync(path);
                  reject(error);
                })
                .pipe(fse.createWriteStream(path))
                .on('error', (error) => reject(error))
                .on('finish', () => resolve({ path }));
            });
            return { path };
          },
          // 3. Get meta of media from locally stored file (depends on 2)
          getMediaMeta: [
            'storeFileLocally',
            async (res) => this['ffmpeg-meta'](res.storeFileLocally.path),
          ],
          // 4. Update meta of media to DB (depends on 3)
          updateMediaMeta: [
            'getMediaMeta',
            async (res) => {
              const ext = res.getMediaMeta.codecName;
              const update = {
                ..._.pick(res.getMediaMeta, ['codecType', 'codecName', 'duration', 'rawInfo']),
                $push: { formats: ext },
              };
              await this.adapter.model.updateOne({ name: ctx.params.name }, update);
            },
          ],
          // 5. Upload file to s3 (depends on 1 & 3)
          uploadFile: [
            'createEntity',
            'getMediaMeta',
            async (res) => {
              try {
                // 5.1. Set progress to started
                await this.actions['process-status']({
                  name: ctx.params.name,
                  process: 'upload',
                  from: 'pending',
                  to: 'started',
                });
                const ext = res.getMediaMeta.codecName;
                const uri = this.constructUri({ name: ctx.params.name, ext });
                // 5.2. Upload
                await s3.putObject(uri, {
                  stream: ctx.params.stream,
                  meta: { 'Content-Type': ctx.params.mimetype },
                });

                // 5.3. WIP update upload progress
                // // // // // // // // // // //

                // 5.4. Set progress to complete
                await this.actions['process-status']({
                  name: ctx.params.name,
                  process: 'upload',
                  from: 'started',
                  to: 'completed',
                  progress: 100,
                });
              } catch (err) {
                // 5.5. Any error set the error and status of process to error
                const error = JSON.stringify(err, Object.getOwnPropertyNames(err));
                await this.actions['process-status']({
                  name: ctx.params.name,
                  process: 'upload',
                  from: 'started',
                  to: 'error',
                  error,
                });
              }
            },
          ],
          // 6. Cleanup the temporary file
          cleanUp: [
            'uploadFile',
            async (res) => fse.remove(res.storeFileLocally.path),
          ],
          updateMediaStatus: [
            'uploadFile',
            async () => this.adapter.model.updateOne({ name: ctx.params.name }, { status: true }),
          ],
        });
      },
    },
  },
};
