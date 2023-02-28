const User = require('../models/User');
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    const token = req.header("Authorization").replace("Bearer ", "");
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, data) => {
            if(err) res.status(403).json({ message: "Invalid token"});
            const user = await User.findOne({ _id: data._id });
            if(!user) {
                return res.status(403).json({ message: "Invalid token"});
            }
            req.user = user;
            next();
        })
    } else {
        res.status(403).json({ message: "Invalid request"});
    }
}

module.exports = { verifyToken };