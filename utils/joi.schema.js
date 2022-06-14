const Joi = require('joi');

const JOI_ID = Joi.string().alphanum().length(24).regex(new RegExp('^[0-9a-fA-F]{24}$'));
const JOI_AUTHKEY = Joi.string().length(21);

module.exports = {
  JOI_ID,
  JOI_AUTHKEY,
};
