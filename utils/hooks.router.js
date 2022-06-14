module.exports = {
  onBeforeCall(ctx, route, req) {
    const ip = req.headers['x-forwarded-for']
      || req.connection.remoteAddress
      || req.socket.remoteAddress
      || req.connection.socket.remoteAddress;

    if (ip.includes(',')) [ctx.meta.ip] = ip.split(',');
    else ctx.meta.ip = ip;
  },
};
