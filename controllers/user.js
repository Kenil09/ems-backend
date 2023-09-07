const User = require("../models/User");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const sendSecurityCode = require("../utils/mail/securityCode");
const generateOtp = require("../utils/generateOtp");
const uploadFileToS3 = require("../utils/upload/uploadFileToS3");
const removeFilesFromS3 = require("../utils/upload/removeFilesFromS3");

const createUserValidation = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  nickName: Joi.string(),
  email: Joi.string().email().required(),
  role: Joi.string()
    .valid("admin", "teamMember", "teamIncharge", "manager")
    .required(),
  department: Joi.string(),
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

const registerUserValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(20).required(),
  securityCode: Joi.string()
    .pattern(/^[0-9]+$/)
    .length(6)
    .required(),
});

exports.postCreateUser = async (req, res) => {
  try {
    const validateRequest = createUserValidation.validate(req.body);
    if (validateRequest.error) {
      console.log(validateRequest.error.details);
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const securityCode = generateOtp();

    const user = new User({
      ...req.body,
      company: req.user.company._id,
      createdBy: req.user._id,
      securityCode,
    });
    const mailStatus = await sendSecurityCode(req.body.email, securityCode);
    if (mailStatus.$metadata.httpStatusCode === 200 && mailStatus.MessageId) {
      const result = await (
        await user.save()
      ).populate([
        "company",
        "department",
        "designation",
        "reportingManager",
        "createdBy",
        "updatedBy",
      ]);
      return res
        .status(200)
        .json({ message: "User created succesfully", user: result });
    } else {
      return res.status(500).json({ message: "Error while sending mail" });
    }
  } catch (error) {
    console.log("create user", error.message, error);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const validateRequest = registerUserValidation.validate(req.body);
    if (validateRequest.error) {
      console.log(validateRequest.error.details);
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const { email, password, securityCode } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (Number(securityCode) !== Number(user.securityCode)) {
      return res.status(401).json({ message: "Invalid security code" });
    }
    user.isActive = true;
    user.password = password;
    await user.save();
    res.status(200).json({ message: "User registerd successfully" });
  } catch (error) {
    console.log("Register user", error.message);
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
        res
          .status(400)
          .json({ message: "Please verify you account with provided email" });
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
    let users = null;
    if (req.query.companyId) {
      users = await User.find({ company: req.query.companyId }).populate([
        "company",
        "department",
        "designation",
        "reportingManager",
        "createdBy",
        "updatedBy",
      ]);
    } else {
      users = await User.find({ company: req?.user?.company?._id }).populate([
        "company",
        "department",
        "designation",
        "reportingManager",
        "createdBy",
        "updatedBy",
      ]);
    }
    res.status(200).json({ users });
  } catch (error) {
    console.log("get All User", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate([
      "company",
      "department",
      "designation",
      "reportingManager",
      "createdBy",
      "updatedBy",
    ]);
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findByIdAndDelete(req.params.id).session(session);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    if (user?.profilePicture && user?.profilePicture !== "default.jpeg") {
      const response = await removeFilesFromS3(
        process.env.BUCKET,
        `profile/${user?.profilePicture}`
      );
      if (response.$metadata.httpStatusCode !== 204) {
        await session.abortTransaction();
        return res.status(500).json({ message: "Internal server error" });
      }
    }
    await session.commitTransaction();
    res.status(200).json({ message: "User is deleted successfully", user });
  } catch (error) {
    console.log("get user by id", error.message);
    res.status(500).json({ message: "Internal sever error" });
  } finally {
    await session.endSession();
  }
};

exports.updateUserDetails = async (req, res) => {
  try {
    const keys = Object.keys(req.body);

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    keys.forEach((key) => {
      user[key] = req.body[key];
    });

    const result = await (
      await user.save()
    ).populate([
      "company",
      "department",
      "designation",
      "reportingManager",
      "createdBy",
      "updatedBy",
    ]);

    res
      .status(200)
      .json({ message: "Details is updated successfully", user: result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal Server error" });
  }
};

exports.updateProfilePic = async (req, res) => {
  try {
    const { files } = req;
    if (files.length !== 1 && !req.params.id) {
      return res.status(400).json({ message: "Bad request" });
    }
    const user = await User.findById(req.params.id).populate([
      "company",
      "department",
      "designation",
      "reportingManager",
      "createdBy",
      "updatedBy",
    ]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const image = await sharp(files[0].buffer).metadata();
    const resizeImage = await sharp(files[0].buffer)
      .resize({
        width: Math.ceil(image.width / 2),
        height: Math.ceil(image.height / 2),
      })
      .toBuffer();
    const fileType = req.files[0].originalname.split(".");
    const response = await uploadFileToS3(
      { buffer: resizeImage, originalname: files[0].originalname },
      process.env.BUCKET,
      `profile/${user?._id.toString()}.${fileType[fileType.length - 1]}`
    );
    if (response.$metadata.httpStatusCode !== 200) {
      return res.status(500).json({ message: "Error while uploading picture" });
    }
    user.profilePicture = `${user._id}.${fileType[fileType.length - 1]}`;
    await user.save();
    res
      .status(200)
      .json({ message: "Profile picture updated successfully", user });
  } catch (error) {
    console.log("get user by id", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};
