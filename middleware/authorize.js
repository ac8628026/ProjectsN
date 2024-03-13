const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'YourJWTSecretKey';

const authorize = (roles) => {
    return async (req, res, next) => {
        try {
            const token = req.header('auth-token');
            if (!token) {
                return res.status(401).json({ error: "Please log in with correct details" });
            }
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.user.id);
            if (!user) {
                return res.status(401).json({ error: "User not authorized" });
            }
            if (!roles.includes(user.role)) {
                return res.status(403).json({ error: "User not authorized for this action" });
            }
            req.user = user;
            next();
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Server Error' });
        }
    };
};

module.exports = authorize;


