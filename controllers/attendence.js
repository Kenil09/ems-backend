const Attendence = require("../models/Attendence");
const Shift = require("../models/Shift");
const Leave = require("../models/Leave");
const Joi = require("joi");

exports.checkIn = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkUserCheckIn = await Attendence.findOne({
      user: req.user._id,
      createdAt: { $gte: today },
    }).sort({ createdAt: -1 });
    if (!checkUserCheckIn.checkOut) {
      return res.status(400).json({ message: "User is already check in" });
    }

    const attendence = new Attendence({
      checkIn: new Date(),
      user: req.user._id,
    });
    const result = await (await attendence.save()).populate(["user"]);
    res
      .status(200)
      .json({ message: "User check in successfully", attendence: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const attendence = await Attendence.findOne({
      user: req.user._id,
      createdAt: { $gte: today },
    }).sort({ createdAt: -1 });
    if (attendence.checkOut) {
      return res.status(400).json({ message: "User is already checked out" });
    }
    attendence.checkOut = new Date();
    const result = await (await attendence.save()).populate(["user"]);
    res
      .status(200)
      .json({ message: "User is check out successfully", attendence: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// check Holidays
// check Leave
// Mark absent and present based on days
exports.getUserMonthDetails = async () => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.userStatus = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkUserCheckIn = await Attendence.findOne({
      user: req.params.id,
      createdAt: { $gte: today },
    }).sort({ createdAt: -1 });
    if (!checkUserCheckIn) {
      return res.status(200).json({ checkIn: false });
    }
    res.status(200).json({ checkIn: Boolean(!checkUserCheckIn.checkOut) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
