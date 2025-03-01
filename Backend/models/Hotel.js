const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: String,
  images: [String],
  rooms: [{
    name: String,
    description: String,
    price: Number,
    roomType: String,
    images: [String],
    available: { type: Boolean, default: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Hotel", HotelSchema);
