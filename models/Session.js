const { model, Schema } = require('mongoose');
const { nanoid } = require('nanoid');

const schema = new Schema({
  authkey: { type: String, default: nanoid },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  ip: { type: String, default: '' },
  device: { type: String, default: '' },
  browser: { type: String, default: '' },
  expiresAt: { type: Date, required: true },
  status: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = model('Session', schema);
