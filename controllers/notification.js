const Notification = require("../models/Notification");
const User = require("../models/User");
const Task = require("../models/Tasks");
const Joi = require("joi");
const mongoose = require("mongoose");

const broadCastToCompanyValidation = Joi.object({
  message: Joi.string().required(),
  company: Joi.string().required(),
}).required();

const broadCastToDepartmentValidation = Joi.object({
  message: Joi.string().required(),
  department: Joi.string().required(),
  company: Joi.string().required(),
});

const notifyTaskUsersValidation = Joi.object({
  message: Joi.string().required(),
  task: Joi.string().required(),
  users: Joi.array().items(Joi.string().required()).required(),
});

exports.broadCastToCompany = async (req, res) => {
  try {
    const validateRequest = broadCastToCompanyValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const users = await User.find({ company }).lean();
    const usersId = users.map(({ _id }) => _id);
    const newNotification = new Notification({ ...req.body, users: usersId });
    await newNotification.save();
    res
      .status(200)
      .json({ message: "Notification is successfully broadcasted to company" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.broadCastToDepartment = async (req, res) => {
  try {
    const validateRequest = broadCastToDepartmentValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const users = await User.find({ company, department }).lean();
    const usersId = users.map(({ _id }) => _id);
    const newNotification = new Notification({ ...req.body, users: usersId });
    await newNotification.save();
    res.status(200).json({
      message: "Notification is successfully broadcasted to department",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.notifyTaskUsers = async (req, res) => {
  try {
    const validateRequest = notifyTaskUsersValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const task = await Task.findById(req.body.task);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const newNotification = new Notification({
      message: req.body.message,
      user: req.body.users,
    });
    await newNotification.save();
    res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getNotification = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: { $elemMatch: { $eq: req.user?._id } },
    }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getNotificationCount = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: { $elemMatch: { $eq: req.user?._id } },
    }).lean();
    const count = notifications.length;
    res.status(200).json({ notifications: count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    notification.user = notification.user.filter(
      (id) => id.toString() !== req.user.id
    );
    await notification.save();
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
