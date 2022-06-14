const RouterHooks = require('../utils/hooks.router');

const publicRoutes = [
  {
    path: '/ping',
    aliases: {
      'GET /': 'common.hello',
    },
  },
  {
    path: '/media',
    aliases: {
      'GET /': 'apiMain.media-list',
      'GET /:name': 'apiMain.media-get',
      'POST /:name': 'multipart:apiMain.media-upload',
    },
  },
];

// const authorizedRoutes = [];

module.exports = [
  ...publicRoutes.map((x) => ({
    ...x,
    authorization: false,
    mappingPolicy: 'restrict',
    ...RouterHooks,
    bodyParsers: {
      json: true,
    },
  })),
  // ...authorizedRoutes.map((x) => ({
  //   ...x,
  //   authorization: true,
  //   mappingPolicy: 'restrict',
  //   ...RouterHooks,
  //   bodyParsers: {
  //     json: true,
  //   },
  // })),
];
