const { model, Schema } = require('mongoose');

const schema = new Schema({
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
}, {
  timestamps: true,
});

module.exports = model('User', schema);
