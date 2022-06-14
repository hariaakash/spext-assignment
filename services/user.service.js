const Joi = require('joi');
const _ = require('lodash');
const mongoose = require('mongoose');
const { MoleculerError, MoleculerClientError } = require('moleculer').Errors;

const DbMixin = require('../mixins/mongo.adapter');
const model = require('../models/User');
const { JOI_ID } = require('../utils/joi.schema');
const PasswordManager = require('../utils/password.manager');

module.exports = {
  name: 'user',
  mixins: [
    DbMixin(model),
  ],
  settings: {
    fields: ['_id', 'email', 'password', 'createdAt', 'updatedAt'],
  },
  hooks: {
    after: {
      create: 'filterParams',
      login: 'filterParams',
      get: 'filterParams',
      paginatedList: 'filterParams',
    },
  },
  actions: {
    create: {
      params: () => Joi.object().keys({
        id: JOI_ID.default(() => String(mongoose.Types.ObjectId())),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
      }),
      async handler(ctx) {
        const found = await this.adapter.findOne({ email: ctx.params.email });
        if (found) throw new MoleculerClientError('User with email already exists', 422, 'CLIENT_VALIDATION');

        const reqData = {
          _id: ctx.params.id,
          ..._.pick(ctx.params, ['email', 'password']),
        };
        return this.createUser(reqData);
      },
    },
    login: {
      params: () => Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
      }),
      async handler(ctx) {
        const query = { ..._.pick(ctx.params, ['email']) };

        const entity = await this.adapter.findOne(query);
        if (!entity) throw new MoleculerError('User not found', 404, 'NOT_FOUND');

        if (await PasswordManager.verify(entity.password, ctx.params.password)) return entity;
        throw new MoleculerClientError('Wrong Password', 422, 'CLIENT_VALIDATION');
      },
    },
    get: {
      params: () => Joi.object().keys({
        id: JOI_ID.required(),
      }),
      async handler(ctx) {
        const query = { _id: ctx.params.id };
        const entity = await this.adapter.findOne(query);
        if (!entity) throw new MoleculerError('User not found', 404, 'NOT_FOUND');

        return entity;
      },
    },
    paginatedList: {
      params: () => Joi.object().keys({
        page: Joi.number().default(1),
        pageSize: Joi.number().default(10),
        sort: Joi.string().default('email'),
        search: Joi.string().default(''),
        searchFields: Joi.string().default('email'),
      }),
      async handler(ctx) {
        const entity = await this.actions.list({ ...ctx.params });
        return entity;
      },
    },
  },
  methods: {
    filterParams(ctx, res) {
      const exclude = ['password', '__v'];
      if (res.rows) res.rows = res.rows.map((x) => _.omit(x, exclude));
      else res = _.omit(res.toObject(), exclude);
      return res;
    },
    /* istanbul ignore next */
    async seedDB() {
      const data = [
        {
          email: 'hari@badat.tech',
          password: 'haha1234',
        },
      ];
      await data.forEach(async (x) => {
        const found = await this.adapter.findOne({ email: x.email });
        if (!found) await this.createUser(x);
      });
    },
    async createUser(data) {
      data.password = await PasswordManager.hash(data.password);
      return this.adapter.insert({ ...data });
    },
  },
  async created() {
    await this.seedDB();
  },
};
