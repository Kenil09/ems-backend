const User = require("../models/User");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createUserValidation = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(20).required(),
  role: Joi.string()
    .valid("employee", "manager", "admin", "superAdmin")
    .required(),
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
    await user.save();
    res.status(200).json({ message: "User craeted succesfully", user });
  } catch (error) {
    console.log("create user", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.postLoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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
