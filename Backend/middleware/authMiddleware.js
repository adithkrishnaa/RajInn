const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "super-admin" && req.user.role !== "hotel-admin")) {
    return res.status(403).json({ message: "Access Denied: Admins only" });
  }
  next();
};

const authorizeSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "super-admin") {
    return res.status(403).json({ message: "Access Denied: Super Admins only" });
  }
  next();
};

module.exports = { authenticateUser, authorizeAdmin, authorizeSuperAdmin };
