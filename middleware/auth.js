const User = require("../models/User");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token) {
      return res.status(403).json({ message: "Invalid request" });
    }
    token = token.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, data) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      const user = await User.findOne({ _id: data._id })
        .populate("company")
        .populate("department")
        .populate("designation")
        .populate("reportingManager")
        .populate("createdBy")
        .populate("updatedBy");
      if (!user) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { verifyToken };
