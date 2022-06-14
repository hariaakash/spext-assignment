const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
const { MoleculerError } = require('moleculer').Errors;

module.exports = {
  methods: {
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
