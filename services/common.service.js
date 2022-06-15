const Joi = require('joi');
const os = require('os');
const async = require('async');
const { MoleculerError } = require('moleculer').Errors;

const { JOI_ID } = require('../utils/joi.schema');

const environment = process.env.NODE_ENV || 'development';

module.exports = {
  name: 'common',
  actions: {
    hello: {
      async handler() {
        const res = await async.parallel({
          ram: async () => this.ramUsage(),
          cpu: async () => this.cpuUsage(),
        });
        return { hello: 'world', ...res };
      },
    },
    constructUri: {
      params: () => Joi.object().keys({
        user: JOI_ID.required(),
        name: Joi.string().required(),
        ext: Joi.string().required(),
      }),
      async handler(ctx) {
        const { user, name, ext } = ctx.params;
        const uri = `${environment}/${user}/${name}/${name}.${ext}`;
        return uri;
      },
    },
  },
  methods: {
    ramUsage: {
      async handler() {
        const used = (await process.memoryUsage().heapUsed) / 1024 / 1024;
        const usedMem = Math.round(used * 100) / 100;
        if (!usedMem) throw new MoleculerError('can not get usage', 500, 'SERVER_ERROR');
        return `${usedMem}MB`;
      },
    },
    cpuUsage: {
      async handler() {
        const cpus = os.cpus();
        const cpu = cpus[0];

        const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);

        const usage = await process.cpuUsage();
        const currentCPUUsage = usage.user + usage.system;

        // Find out the percentage used for this specific CPU
        const perc = (currentCPUUsage / total) * 100;

        if (!perc) throw new MoleculerError('can not get usage', 500, 'SERVER_ERROR');
        return `${perc}%`;
      },
    },
  },
};
