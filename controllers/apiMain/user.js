const _ = require('lodash');

module.exports = {
  actions: {
    'user-create': {
      async handler(ctx) {
        const user = await ctx.call('user.create', { ...ctx.params });
        const session = await ctx.call('session.create', {
          user: String(user._id),
          ip: ctx.meta.ip,
          device: 'laptop',
          browser: 'chrome',
        });
        return { user, session };
      },
    },
    'user-login': {
      async handler(ctx) {
        const user = await ctx.call('user.login', { ...ctx.params });
        return ctx.call('session.create', {
          user: String(user._id),
          ip: ctx.meta.ip,
          device: 'laptop',
          browser: 'chrome',
          ..._.pick(ctx.params, ['longerSession']),
        });
      },
    },
    'user-me': {
      async handler(ctx) {
        return { ..._.pick(ctx.meta, ['user', 'session']) };
      },
    },
    'user-logout': {
      async handler(ctx) {
        return ctx.call('session.logout', { authkey: ctx.meta.authkey });
      },
    },
  },
};
