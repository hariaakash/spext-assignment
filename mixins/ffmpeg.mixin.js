const fse = require('fs-extra');
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
const { MoleculerError } = require('moleculer').Errors;

module.exports = {
  methods: {
    'ffmpeg-convert': {
      async handler({ from, to }) {
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
    },
    'ffmpeg-meta': {
      async handler(from) {
        const { streams = [] } = await ffprobe(from, { path: ffprobeStatic.path });
        const [media] = streams;
        if (!media) throw new MoleculerError('Cannot read metadata', 500, 'SERVER_ERROR');

        const { codec_type: codecType, codec_name: codecName, duration } = media;

        return {
          codecType,
          codecName,
          duration,
          rawInfo: media,
        };
      },
    },
  },
};
