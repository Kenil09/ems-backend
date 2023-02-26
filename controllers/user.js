const User = require("../models/User");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createUserValidation = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  nickName: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(20).required(),
  role: Joi.string()
    .valid("admin", "teamMember", "teamIncharge", "manager", "departmentLead")
    .required(),
  department: Joi.string(),
  company: Joi.string().required(),
  designation: Joi.string(),
  location: Joi.string(),
  employeeType: Joi.string().valid(
    "permanent",
    "onContract",
    "temporary",
    "trainee"
  ),
  joiningDate: Joi.date().required(),
  reportingManager: Joi.string(),
  gender: Joi.string().valid("male", "female", "other"),
  birthDate: Joi.date(),
  maritalStatus: Joi.string(),
  aboutMeInfo: Joi.string(),
  phoneNumber: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/),
  personalContact: Joi.object({
    email: Joi.string().email(),
    phoneNumber: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/),
  }),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    postalCode: Joi.string(),
  }),
  workExperience: Joi.array().items(
    Joi.object({
      previousCompany: Joi.string().required(),
      jobTitle: Joi.string().required(),
      fromDate: Joi.date().required(),
      toDate: Joi.date().required(),
      jobDescription: Joi.string().required(),
      relevant: Joi.boolean().required(),
    })
  ),
  educationDetails: Joi.array().items(
    Joi.object({
      university: Joi.string().required(),
      degree: Joi.string().required(),
      dateOfCompletion: Joi.string().required(),
    })
  ),
});

exports.postCreateUser = async (req, res) => {
  try {
    const validateRequest = createUserValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const user = new User({ ...req.body, isActive: false });
    const result = await (
      await (
        await (await user.save()).populate("company")
      ).populate("department")
    ).populate("EmployeeRole");
    res.status(200).json({ message: "User created succesfully", user: result });
  } catch (error) {
    console.log("create user", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.postLoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .populate("company")
      .populate("department");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (bcrypt.compareSync(password, user.password)) {
      if (user.isActive) {
        const { password, ...other } = user._doc;
        const token = jwt.sign(other, process.env.JWT_SECRET_KEY, {
          expiresIn: "3h",
        });
        res.status(200).json({ token });
      } else {
        res.status(400).json({ message: "User is not active" });
      }
    } else {
      res.status(400).json({ message: "Invalid Password" });
    }
  } catch (error) {
    console.log("login user", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("company").populate("department");
    res.status(200).json({ users });
  } catch (error) {
    console.log("get All User", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("company")
      .populate("department");
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.log("get user by id", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User is deleted successfully", user });
  } catch (error) {
    console.log("get user by id", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};
