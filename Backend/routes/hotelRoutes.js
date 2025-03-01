const express = require("express");
const router = express.Router();
const Hotel = require("../models/Hotel");
const User = require("../models/User");

// ✅ Super Admin - Add a New Hotel
router.post("/add-hotel", async (req, res) => {
  try {
    const { adminId, name, location, description, images } = req.body;

    // Verify Super Admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "super-admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const newHotel = new Hotel({ name, location, description, images, rooms: [] });
    await newHotel.save();
    res.status(201).json({ message: "Hotel added successfully", hotel: newHotel });
  } catch (error) {
    res.status(500).json({ message: "Error adding hotel", error: error.message });
  }
});

// ✅ Super Admin - Edit Hotel Details (Including Images)
router.put("/edit-hotel/:hotelId", async (req, res) => {
  try {
    const { adminId, name, location, description, images } = req.body;

    // Verify Super Admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "super-admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.hotelId,
      { name, location, description, images },
      { new: true }
    );

    if (!updatedHotel) return res.status(404).json({ message: "Hotel not found" });

    res.status(200).json({ message: "Hotel updated successfully", hotel: updatedHotel });
  } catch (error) {
    res.status(500).json({ message: "Error updating hotel", error: error.message });
  }
});

// ✅ Super Admin - Delete Hotel
router.delete("/delete-hotel/:hotelId", async (req, res) => {
  try {
    const { adminId } = req.body;

    // Verify Super Admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "super-admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const deletedHotel = await Hotel.findByIdAndDelete(req.params.hotelId);
    if (!deletedHotel) return res.status(404).json({ message: "Hotel not found" });

    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting hotel", error: error.message });
  }
});

// ✅ Super Admin - View All Hotels
router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels", error: error.message });
  }
});


// ✅ Super Admin - Add Room to a Hotel
router.post("/add-room/:hotelId", async (req, res) => {
  try {
    const { adminId, name, description, price, images, type } = req.body;

    // Validate Super Admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "super-admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    // ✅ Convert price to number & validate
    const numericPrice = parseFloat(price.toString().replace(/,/g, ""));
    if (isNaN(numericPrice)) {
      return res.status(400).json({ message: "Invalid price format" });
    }

    // ✅ Add room
    const newRoom = { name, description, price: numericPrice, type, images, available: true };
    hotel.rooms.push(newRoom);
    await hotel.save();

    res.status(201).json({ message: "Room added successfully", hotel });
  } catch (error) {
    res.status(500).json({ message: "Error adding room", error: error.message });
  }
});


// ✅ Super Admin - Edit Room Details
router.put("/edit-room/:hotelId/:roomId", async (req, res) => {
  try {
    const { adminId, name, description, price, images } = req.body;

    // Verify Super Admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "super-admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const room = hotel.rooms.id(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.name = name;
    room.description = description;
    room.price = price;
    room.images = images;
    await hotel.save();

    res.status(200).json({ message: "Room updated successfully", hotel });
  } catch (error) {
    res.status(500).json({ message: "Error updating room", error: error.message });
  }
});

// ✅ Super Admin - Delete Room from a Hotel
router.delete("/delete-room/:hotelId/:roomId", async (req, res) => {
  try {
    const { adminId } = req.body;

    // Verify Super Admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "super-admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    hotel.rooms = hotel.rooms.filter((room) => room._id.toString() !== req.params.roomId);
    await hotel.save();

    res.status(200).json({ message: "Room deleted successfully", hotel });
  } catch (error) {
    res.status(500).json({ message: "Error deleting room", error: error.message });
  }
});

// ✅ Get All Rooms for a Specific Hotel
router.get("/rooms/:hotelId", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    res.status(200).json(hotel.rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error: error.message });
  }
});



router.get("/:hotelId", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotel", error: error.message });
  }
});



module.exports = router;
