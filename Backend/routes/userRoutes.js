const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticateUser, authorizeSuperAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Register User (Default role: "user")
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, country, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !email || !country || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (userExists) {
      return res.status(400).json({ message: "Email or phone number already registered" });
    }

    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      country,
      phoneNumber,
      password, // Password is automatically hashed in the model
      role: "user",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

// ✅ Login User
router.post("/login", async (req, res) => {
  try {
    const { loginId, password } = req.body;
    const user = await User.findOne({ $or: [{ email: loginId.toLowerCase() }, { phoneNumber: loginId }] });

    if (!user) {
      return res.status(400).json({ message: "Invalid email/phone or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email/phone or password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role, hotelId: user.hotelId || null }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ Create Super Admin (Only Run Once)
router.post("/create-super-admin", async (req, res) => {
  try {
    const { firstName, lastName, email, country, phoneNumber, password } = req.body;

    const superAdminExists = await User.findOne({ role: "super-admin" });
    if (superAdminExists) {
      return res.status(400).json({ message: "Super admin already exists" });
    }

    const newSuperAdmin = new User({ firstName, lastName,  email: email.toLowerCase(), country, phoneNumber, password, role: "super-admin" });
    await newSuperAdmin.save();

    res.status(201).json({ message: "Super admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating super admin", error: error.message });
  }
});

// ✅ Create Hotel Admin (Only Super Admin Can Do This)
router.post("/create-hotel-admin", authenticateUser, authorizeSuperAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, hotelId } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (userExists) {
      return res.status(400).json({ message: "Email or phone number already registered" });
    }

    const newHotelAdmin = new User({ firstName, lastName,  email: email.toLowerCase(), phoneNumber, password, role: "hotel-admin", hotelId });
    await newHotelAdmin.save();

    res.status(201).json({ message: "Hotel admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating hotel admin", error: error.message });
  }
});


router.get("/", authenticateUser, authorizeSuperAdmin, async (req, res) => {
  try {
    // Fetch users with role 'user'
    const users = await User.find({ role: "user" }).select("-password"); // Exclude password from the response

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


// ✅ Get Logged-in User Data
router.get("/me", authenticateUser, async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
