const DbService = require('moleculer-db');
const MongooseAdapter = require('moleculer-db-adapter-mongoose');

const mongoUri = process.env.ADAPTER || 'mongodb://localhost:27017/test';
const mongoOpts = { useUnifiedTopology: true };
const adapter = new MongooseAdapter(mongoUri, mongoOpts);

module.exports = (model) => ({ mixins: [DbService], adapter, model });
