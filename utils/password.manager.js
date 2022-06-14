const bcrypt = require('bcryptjs');

const verify = async (hashData, password) => bcrypt.compare(password, hashData);
const hash = async (password) => bcrypt.hash(password, 8);

module.exports = {
  verify,
  hash,
};
