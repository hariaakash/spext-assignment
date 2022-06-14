const Joi = require('joi');
const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const moment = require('moment');

const DbMixin = require('../mixins/mongo.adapter');
const model = require('../models/Session');
const { JOI_ID, JOI_AUTHKEY } = require('../utils/joi.schema');

module.exports = {
  name: 'session',
  mixins: [
    DbMixin(model),
  ],
  settings: {
    fields: ['_id', 'authkey', 'user', 'ip', 'device', 'browser', 'expiresAt', 'status'],
  },
  hooks: {
    after: {
      create: 'filterParams',
      check: 'filterParams',
    },
  },
  actions: {
    create: {
      params: () => Joi.object().keys({
        user: JOI_ID.required(),
        ip: Joi.string().ip().required(),
        device: Joi.string().required(),
        browser: Joi.string().required(),
        expiresAt: Joi.date(),
        longerSession: Joi.bool().default(true),
      }),
      handler(ctx) {
        const days = ctx.params.longerSession ? 30 : 10;
        const entity = { expiresAt: this.expiresAt(days), ...ctx.params };
        return this.adapter.insert(entity);
      },
    },
    check: {
      params: () => Joi.object().keys({
        authkey: JOI_AUTHKEY.required(),
        ip: Joi.string().ip().required(),
      }),
      async handler(ctx) {
        const res = await this.adapter.findOne({
          authkey: ctx.params.authkey,
          // ip: ctx.params.ip,
          expiresAt: { $gt: moment().utc().format() },
          status: true,
        });
        if (!res) throw new MoleculerError('Session not found', 404, 'NOT_FOUND');
        return res;
      },
    },
    logout: {
      params: () => Joi.object().keys({
        authkey: JOI_AUTHKEY.required(),
      }),
      async handler(ctx) {
        await this.adapter.model.updateOne({ authkey: ctx.params.authkey, status: true }, { status: false });
        return { message: 'Logged out' };
      },
    },
  },
  methods: {
    filterParams(ctx, res) {
      const exclude = ['__v'];
      res = _.omit(res.toObject(), exclude);
      return res;
    },
    expiresAt(x = 1) {
      const date = moment().add(x, 'days').utc();
      return date.format();
    },
  },
};
