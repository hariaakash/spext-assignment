const user = require('./user');
const media = require('./media');
const conversion = require('./conversion');

module.exports = {
  mixins: [
    user,
    media,
    conversion,
  ],
};
