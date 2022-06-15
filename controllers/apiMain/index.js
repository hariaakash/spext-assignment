const user = require('./user');
const media = require('./media');
const conversion = require('./conversion');
const download = require('./download');

module.exports = {
  mixins: [
    user,
    media,
    conversion,
    download,
  ],
};
