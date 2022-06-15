const mime = require('mime-types');

module.exports = {
  actions: {
    'download-stream': {
      async handler(ctx) {
        const { stream, name, ext } = await ctx.call('download.stream', { ...ctx.params, user: String(ctx.meta.user._id) });
        ctx.meta.$responseType = mime.lookup(ext);
        ctx.meta.$responseHeaders = {
          'Content-Disposition': `attachment; filename="data-${name}.${ext}"`,
        };
        return stream;
      },
    },
    'download-fetch': {
      async handler(ctx) {
        const url = await ctx.call('download.fetch', { ...ctx.params, user: String(ctx.meta.user._id) });
        ctx.meta.$statusCode = 302;
        ctx.meta.$location = url;
      },
    },
  },
};
