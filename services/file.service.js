const _ = require('lodash');
const async = require('async');
const Joi = require('joi');
const { MoleculerClientError } = require('moleculer').Errors;

const s3 = require('../utils/s3.client');
const { JOI_ID } = require('../utils/joi.schema');

module.exports = {
  name: 'file',
  hooks: {
    before: {
      stream: ['media-get'],
      fetch: ['media-get'],
    },
    after: {
      stream: ['media-view'],
      fetch: ['media-view'],
    },
  },
  actions: {
    stream: {
      params: () => Joi.object().keys({
        user: JOI_ID.required(),
        name: Joi.string().required(),
        ext: Joi.string().default(null),
      }),
      async handler(ctx) {
        const uri = await ctx.call('common.constructUri', { ..._.pick(ctx.params, ['user', 'name']), ext: ctx.locals.ext });
        const stream = await s3.getStream(uri);
        return { stream, ext: ctx.locals.ext, name: ctx.params.name };
      },
    },
    fetch: {
      params: () => Joi.object().keys({
        user: JOI_ID.required(),
        name: Joi.string().required(),
        ext: Joi.string().default(null),
      }),
      async handler(ctx) {
        const uri = await ctx.call('common.constructUri', { ..._.pick(ctx.params, ['user', 'name']), ext: ctx.locals.ext });
        const res = await s3.get(uri);
        return res;
      },
    },
  },
  methods: {
    'media-get': {
      async handler(ctx) {
        const entity = await ctx.call('media.get', { ..._.pick(ctx.params, ['user', 'name']) });
        if (!entity.status) throw new MoleculerClientError('Media not active', 404, 'NOT_FOUND');
        ctx.locals.entity = entity;

        let { ext } = ctx.params;
        if (!entity.formats.includes(ext)) [ext] = entity.formats;
        ctx.locals.ext = ext;
      },
    },
    'media-view': {
      async handler(ctx, res) {
        ctx.emit('media.view', { ..._.pick(ctx.params, ['user', 'name']), ext: ctx.locals.ext });
        return res;
      },
    },
  },
  events: {
    'file.delete': {
      async handler(ctx) {
        // params: { user, name, formats }
        await async.eachLimit(ctx.params.formats, 2, async (ext) => {
          const uri = await ctx.call('common.constructUri', { ..._.pick(ctx.params, ['user', 'name']), ext });
          await s3.delete(uri);
        });
      },
    },
  },
};
