// routes for auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authorize = require('../middleware/authorize');
const { check, validationResult } = require('express-validator');
const JWT_SECRET="YourJWTSecretKey"

// Route 1: Create a User using: POST "/api/auth/". No login required
router.post(
    '/createuser',
    [
        check('username', 'Enter a valid username').isLength({ min: 3 }),
        check('role', 'Enter a valid role').isLength({ min: 3 }),
        check('password', 'Password must be of minimum 5 characters length').isLength({
            min: 3,
        }),
    ],
    async (req, res) => {
        let success = false;
        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }
        // Check whether the user with this username exists already
        try {
            let user = await User.findOne({ username: req.body.username });
            if (user) {
                return res.status(400).json({ success, error: "Sorry a user with this username already exists" });
            }
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            user = await User.create({
                email: req.body.email,
                username: req.body.username,
                role: req.body.role,
                password: secPass,
            });
            success = true;
            const data = {
                user: {
                    id: user.id,
                },
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            res.json({ success, authToken });
        } catch (error) {
            console.error(error.message);
            // console.log("username :",req.body.username);
            res.status(500).send(error.message);
        }
    }
);

// Route 2: Authenticate a User using: POST "/api/auth/login". No login required

router.post(
    '/login',
    [
        check('username', 'Enter a valid username').isLength({ min: 3 }),
        check('password', 'Password cannot be blank').exists(),
    ],
    async (req, res) => {
        let success = false;
        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }
        const { username, password } = req.body;
        try {
            let user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ success, error: "Please try to login with correct credentials" });
            }
            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                return res.status(400).json({ success, error: "Please try to login with correct credentials" });
            }
            success = true;
            const data = {
                user: {
                    id: user.id,
                },
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            res.json({ success, authToken });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    }
);

// Route 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser',authorize(['SuperAdmin', 'Admin', 'Client']) , async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}
);

module.exports = router;


