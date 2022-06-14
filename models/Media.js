const { model, Schema } = require('mongoose');

const schema = new Schema({
  name: { type: String, required: true },
  codecType: { type: String },
  codecName: { type: String },
  duration: { type: Number },
  rawInfo: { type: Schema.Types.Mixed },
  formats: [String],
  processes: [
    {
      action: { type: String, enum: ['upload', 'convert'] },
      progress: { type: Number, default: 0 },
      status: { type: String, enum: ['pending', 'started', 'completed', 'error'], default: 'pending' },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      error: { type: String },
    },
  ],
  status: { type: Boolean, default: false },
}, {
  timestamps: true,
});

module.exports = model('Media', schema);
