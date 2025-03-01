const express = require("express");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const router = express.Router();

// ✅ Create a Booking
router.post("/add-booking", async (req, res) => {
  try {
    const { userId, hotelId, roomId, checkIn, checkOut, guests, totalPrice } = req.body;

    // Validate Required Fields
    if (!userId || !hotelId || !roomId || !checkIn || !checkOut || !guests || !totalPrice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    // Check if the room exists in the selected hotel
    const room = hotel.rooms.id(roomId);
    if (!room) return res.status(404).json({ message: "Room not found in this hotel" });

    // Create new booking
    const newBooking = new Booking({
      userId,
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
    });

    await newBooking.save();
    res.status(201).json({ message: "Booking successful", booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
});

// ✅ Get All Bookings for a User
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId }).populate("hotelId").populate("roomId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
});

// ✅ Get Booking Details
router.get("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("hotelId").populate("roomId");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking details", error: error.message });
  }
});

// ✅ Cancel Booking
router.delete("/cancel/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    if (!deletedBooking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
});

module.exports = router;
