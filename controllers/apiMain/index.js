const user = require('./user');
const media = require('./media');
const conversion = require('./conversion');
const file = require('./file');
const stats = require('./stats');

module.exports = {
  mixins: [
    user,
    media,
    conversion,
    file,
    stats,
  ],
};
