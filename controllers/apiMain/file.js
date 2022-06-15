const mime = require('mime-types');

module.exports = {
  actions: {
    'file-stream': {
      async handler(ctx) {
        const { stream, name, ext } = await ctx.call('file.stream', { ...ctx.params, user: String(ctx.meta.user._id) });
        ctx.meta.$responseType = mime.lookup(ext);
        ctx.meta.$responseHeaders = {
          'Content-Disposition': `attachment; filename="data-${name}.${ext}"`,
        };
        return stream;
      },
    },
    'file-fetch': {
      async handler(ctx) {
        const url = await ctx.call('file.fetch', { ...ctx.params, user: String(ctx.meta.user._id) });
        ctx.meta.$statusCode = 302;
        ctx.meta.$location = url;
      },
    },
  },
};
