const RouterHooks = require('../utils/hooks.router');

const publicRoutes = [
  {
    path: '/ping',
    aliases: {
      'GET /': 'common.hello',
    },
  },
  {
    path: '/public',
    aliases: {
      'POST /create': 'apiMain.user-create',
      'POST /login': 'apiMain.user-login',
      'GET /media/:id': 'apiMain.file-getPublic',
    },
  },
];

const authorizedRoutes = [
  {
    path: '/user',
    aliases: {
      'GET /': 'apiMain.user-me',
      'DELETE /': 'apiMain.user-logout',
    },
  },
  {
    path: '/media',
    aliases: {
      'GET /': 'apiMain.media-list',
      'GET /:name': 'apiMain.media-get',
      'POST /:name': 'multipart:apiMain.media-upload',
      'PUT /publicStatus/:name': 'apiMain.media-publicStatus',
      'DELETE /:name': 'apiMain.media-delete',
    },
  },
  {
    path: '/conversion',
    aliases: {
      'GET /': 'apiMain.conversion-list',
      'GET /:name': 'apiMain.conversion-get',
      'POST /:name': 'apiMain.conversion-process',
    },
  },
  {
    path: '/file',
    aliases: {
      'GET /stream/:name': 'apiMain.file-stream',
      'GET /fetch/:name': 'apiMain.file-fetch',
    },
  },
  {
    path: '/stats',
    aliases: {
      'GET /global': 'apiMain.stats-global',
      'GET /': 'apiMain.stats-user',
    },
  },
];

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
  ...authorizedRoutes.map((x) => ({
    ...x,
    authorization: true,
    mappingPolicy: 'restrict',
    ...RouterHooks,
    bodyParsers: {
      json: true,
    },
  })),
];
