const express = require("express");
const Hotel = require("../models/Hotel");
const router = express.Router();

// ✅ Add Room to a Hotel
router.post("/add-room/:hotelId", async (req, res) => {
  try {
    const { name, description, price, roomType, images } = req.body;
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const newRoom = { name, description, price, roomType, images };
    hotel.rooms.push(newRoom);
    await hotel.save();

    res.status(201).json({ message: "Room added successfully", hotel });
  } catch (error) {
    res.status(500).json({ message: "Error adding room", error: error.message });
  }
});

// ✅ Get All Rooms for a Hotel
router.get("/rooms/:hotelId", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    res.status(200).json(hotel.rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error: error.message });
  }
});

module.exports = router;
