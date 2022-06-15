const _ = require('lodash');
const Joi = require('joi');
const mime = require('mime-types');
const { MoleculerError } = require('moleculer').Errors;

const { JOI_ID } = require('../../utils/joi.schema');

module.exports = {
  actions: {
    'file-stream': {
      async handler(ctx) {
        try {
          const { stream, name, ext } = await ctx.call('file.stream', { ...ctx.params, user: String(ctx.meta.user._id) });
          ctx.meta.$responseType = mime.lookup(ext);
          ctx.meta.$responseHeaders = {
            'Content-Disposition': `attachment; filename="data-${name}.${ext}"`,
          };
          return stream;
        } catch (err) {
          const error = JSON.stringify(err, Object.getOwnPropertyNames(err));
          throw new MoleculerError('Media stream failed', 500, 'SERVER_ERROR', { error });
        }
      },
    },
    'file-fetch': {
      async handler(ctx) {
        const url = await ctx.call('file.fetch', { ...ctx.params, user: String(ctx.meta.user._id) });
        ctx.meta.$statusCode = 302;
        ctx.meta.$location = url;
      },
    },
    'file-getPublic': {
      params: () => Joi.object().keys({
        id: JOI_ID.required(),
        ext: Joi.string(),
      }),
      async handler(ctx) {
        const entity = await ctx.call('media.getPublic', { ...ctx.params });

        try {
          const { stream, name, ext } = await ctx.call('file.stream', {
            user: String(entity.user),
            name: entity.name,
            ..._.pick(ctx.params, ['ext']),
          });
          ctx.meta.$responseType = mime.lookup(ext);
          ctx.meta.$responseHeaders = {
            'Content-Disposition': `attachment; filename="data-${name}.${ext}"`,
          };
          return stream;
        } catch (err) {
          const error = JSON.stringify(err, Object.getOwnPropertyNames(err));
          throw new MoleculerError('Media stream failed', 500, 'SERVER_ERROR', { error });
        }
      },
    },
  },
};
