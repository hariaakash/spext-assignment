// const { FFmpegCommand, FFmpegInput, FFmpegOutput } = require('fessonia')();
const fse = require('fs-extra');
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
const { MoleculerError } = require('moleculer').Errors;

module.exports = {
  name: 'main',
  methods: {
    async convertAudo({ from, to }) {
      const ffmpeg = createFFmpeg();
      await ffmpeg.load();
      console.log('q');
      console.log('ffmpeg loaded');
      ffmpeg.setProgress(({ ratio }) => {
        console.log(ratio);
      });
      ffmpeg.FS('writeFile', from.name, await fetchFile(from.fullPath));
      await ffmpeg.run('-i', from.name, to.name);
      await fse.promises.writeFile(to.fullPath, ffmpeg.FS('readFile', to.name));
    },
    async getMeta(from) {
      const { streams = [] } = await ffprobe(from, { path: ffprobeStatic.path });
      const [media] = streams;
      if (!media) throw new MoleculerError('Cannot read metadata', 500, 'SERVER_ERROR');
      return media;
    },
  },
  async created() {
    try {
      // const arr = new Array(10).fill(0);
      // console.log(arr);
      // arr.forEach(async (x, key) => {
      //   console.log('qq', key);
      //   await this.convertAudo({ key });
      // });
      const from = { path: './static', name: '1.mp3', fullPath: './static/1.mp3' };
      const to = { path: './static', name: '1.ogg', fullPath: './static/1.ogg' };

      // await this.convertAudo({
      //   from: { path: './static', name: '1.mp3', fullPath: './static/1.mp3' },
      //   to: { path: './static', name: '1.ogg', fullPath: './static/1.ogg' },
      // });
      // const res = await this.getMeta('./static/1.mp4');
      // console.log(res);
      console.log('completed');
    } catch (err) {
      console.log(err);
    }
  },
};
