const { MoleculerError } = require('moleculer').Errors;

module.exports = {
  actions: {
    'media-list': {
      async handler(ctx) {
        return ctx.call('media.paginatedList', { ...ctx.params });
      },
    },
    'media-get': {
      async handler(ctx) {
        return ctx.call('media.get', { ...ctx.params });
      },
    },
    'media-upload': {
      async handler(ctx) {
        const { name } = ctx.meta.$params;
        if (!name) throw new MoleculerError('Media name not found', 404, 'NOT_FOUND');
        if (!ctx.params) throw new MoleculerError('Media not found', 404, 'NOT_FOUND');

        return ctx.call('media.upload', {
          name,
          stream: ctx.params,
          mimetype: ctx.meta.mimetype,
        });
      },
    },
  },
};
