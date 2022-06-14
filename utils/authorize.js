const { UnAuthorizedError, ERR_INVALID_TOKEN, ERR_NO_TOKEN } = require('moleculer-web').Errors;
const { MoleculerError } = require('moleculer').Errors;

const authorize = async (ctx, route, req) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) throw new UnAuthorizedError(ERR_NO_TOKEN);

  ctx.meta.authkey = auth.slice(7);
  let session;
  try {
    session = await ctx.call('session.check', { authkey: ctx.meta.authkey, ip: ctx.meta.ip });

    // this.broker.cacher.set('cachedData.user', { user: session.user });
  } catch (e) {
    if (e.type === 'SERVICE_NOT_AVAILABLE') {
      throw new MoleculerError('Services are yet to startup', 408, 'TIMEOUT');
    } else throw new UnAuthorizedError(ERR_INVALID_TOKEN);
  }
  ctx.meta.session = session;

  ctx.meta.user = await ctx.call('user.get', { id: String(session.user) });
};

module.exports = authorize;
