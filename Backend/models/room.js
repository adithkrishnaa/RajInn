const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String, required: true }], // Multiple images
  availability: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Room", RoomSchema);
