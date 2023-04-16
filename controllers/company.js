const Company = require("../models/Company");
const User = require("../models/User");
const Shift = require("../models/Shift");
const mongoose = require("mongoose");
const Joi = require("joi");
const generateOtp = require("../utils/generateOtp");
const sendSecurityCode = require("../utils/mail/securityCode");

const addCompanyValidation = Joi.object({
  companyDetails: Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipcode: Joi.string().length(6).required(),
  }).required(),
  userDetails: Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
  }).required(),
}).required();

exports.postAddCompany = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const validateRequest = addCompanyValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const company = new Company(req.body.companyDetails);
    await company.save({ session });
    const generalShift = new Shift({
      name: "general",
      startTime: "09:00",
      endTime: "21:00",
      company: company?._id,
      type: "general",
      weekDefinition: [
        {
          sunday: true,
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
        },
        {
          sunday: true,
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
        },
        {
          sunday: true,
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
        },

        {
          sunday: true,
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
        },
        {
          sunday: true,
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
        },
      ],
    });
    await generalShift.save({ session });
    const securityCode = generateOtp();
    const oldUser = await User.find({ email: req.body.userDetails.email });
    if (oldUser.length) {
      await session.abortTransaction();
      return res.json({ message: "User is already registered" });
    }
    const user = new User({
      ...req.body.userDetails,
      role: "admin",
      company: company._id,
      owner: true,
      securityCode,
    });
    const mailStatus = await sendSecurityCode(
      req.body.userDetails.email,
      securityCode
    );
    if (mailStatus.$metadata.httpStatusCode === 200 && mailStatus.MessageId) {
      await user.save({ session });
      await session.commitTransaction();
      return res
        .status(200)
        .json({ message: "Company added successfully", company });
    } else {
      await session.abortTransaction();
      return res.status(500).json({ message: "Error while sending mail" });
    }
  } catch (error) {
    await session.abortTransaction();
    console.log("create company", error.message);
    res.status(500).json({ message: "Internal sever error" });
  } finally {
    await session.endSession();
  }
};

exports.getAllCompany = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json({ companies });
  } catch (error) {
    console.log("get company", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

// configure company api
// create shift
// same shift break time
// configure leaves

// Employee crud - pending update and testing with more data
// Department crud - Next
// Designation crid - Next
// Leave all apis
// attendence thing
// shift
// holidays
// company configuration

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    res.status(200).json({ company });
  } catch (error) {
    console.log("get single company", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json({ company, message: "Company deleted successfully" });
  } catch (error) {
    console.log("delete single company", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const validateRequest = companyValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const allowedUpdates = ["name", "address", "city", "state", "zipcode"];
    const updates = Object.keys(req.body);
    updates.every((update) => {
      if (!allowedUpdates.includes(update)) {
        return res.status(401).json({ message: `${update} is not allowed` });
      }
    });
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    updates.forEach((update) => (company[update] = req.body[update]));
    let result = await company.save();
    res
      .status(200)
      .json({ message: "Company updated successfully", company: result });
  } catch (error) {
    console.log("update company", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};
