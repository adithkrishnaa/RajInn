const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  roomId: { type: String, required: true },  // Room is stored as an embedded object in Hotel
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { adults: Number, children: Number },
  totalPrice: Number,
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);
