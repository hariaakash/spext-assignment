module.exports = {
  actions: {
    'stats-user': {
      async handler(ctx) {
        return ctx.call('media.analytics', { user: String(ctx.meta.user._id) });
      },
    },
    'stats-global': {
      async handler(ctx) {
        return ctx.call('media.analytics', {});
      },
    },
  },
};
