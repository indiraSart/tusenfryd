const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  openTime: { type: String, required: true },
  closeTime: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
  queue: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Attraction', attractionSchema);
