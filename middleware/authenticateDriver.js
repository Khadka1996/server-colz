const jwt = require('jsonwebtoken');
const User = require('../models/Driver'); // Adjust the path according to your structure

const authenticateDriver = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.driver = await User.findById(decoded.id); // Assuming the driver ID is stored in the token
        if (!req.driver) {
            return res.status(404).json({ message: "Driver not found" });
        }
        
        // Check if the authenticated user is a driver
        if (req.driver.role !== 'driver') {
            return res.status(403).json({ message: "Access denied: Not a driver." });
        }
        
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authenticateDriver;
