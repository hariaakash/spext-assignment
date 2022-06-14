const conversions = require('../../static/conversions');

module.exports = {
  actions: {
    'conversion-list': {
      async handler() {
        return conversions;
      },
    },
    'conversion-get': {
      async handler(ctx) {
        return ctx.call('media.getAvailableConversion', { ...ctx.params });
      },
    },
    'conversion-process': {
      async handler(ctx) {
        return ctx.call('media.convert', { ...ctx.params });
      },
    },
  },
};
