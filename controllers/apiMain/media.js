const { MoleculerError } = require('moleculer').Errors;

module.exports = {
  actions: {
    'media-list': {
      async handler(ctx) {
        const { query = {} } = ctx.params;
        query.user = String(ctx.meta.user._id);
        return ctx.call('media.paginatedList', { ...ctx.params, query });
      },
    },
    'media-get': {
      async handler(ctx) {
        return ctx.call('media.get', { ...ctx.params, user: String(ctx.meta.user._id) });
      },
    },
    'media-upload': {
      async handler(ctx) {
        const { name } = ctx.meta.$params;
        if (!name) throw new MoleculerError('Media name not found', 404, 'NOT_FOUND');
        if (!ctx.params) throw new MoleculerError('Media not found', 404, 'NOT_FOUND');

        return ctx.call('media.upload', {
          user: String(ctx.meta.user._id),
          name,
          stream: ctx.params,
          mimetype: ctx.meta.mimetype,
        });
      },
    },
    'media-delete': {
      async handler(ctx) {
        return ctx.call('media.delete', { ...ctx.params, user: String(ctx.meta.user._id) });
      },
    },
  },
};
