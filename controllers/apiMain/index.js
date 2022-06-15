const user = require('./user');
const media = require('./media');
const conversion = require('./conversion');
const download = require('./download');
const stats = require('./stats');

module.exports = {
  mixins: [
    user,
    media,
    conversion,
    download,
    stats,
  ],
};
