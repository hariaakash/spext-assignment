const ApiGateway = require('moleculer-web');

const RouterSettings = require('../mixins/settings.router');
const Service = require('../controllers/apiMain');
const routes = require('../routes/api.main');

module.exports = {
  name: 'apiMain',
  mixins: [ApiGateway, RouterSettings, Service],
  settings: {
    services: ['main', 'media', 'common'],
    port: process.env.PORT || 3000,
    cors: {
      methods: ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
      origin: '*',
    },
    routes,
  },
  async created() {
    await this.broker.waitForServices(this.settings.services);
  },
};
