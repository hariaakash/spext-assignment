const helmet = require('helmet');

const onError = require('../utils/onError.api');

module.exports = {
  settings: {
    use: [
      helmet(),
    ],
    onError,
  },
};
