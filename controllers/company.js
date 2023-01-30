const Company = require("../models/Company");
const Joi = require("joi");

const companyValidation = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipcode: Joi.string().length(6).required(),
});

exports.postAddCompany = async (req, res) => {
  try {
    const validateRequest = companyValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const company = new Company(req.body);
    await company.save();
    res.status(200).json({ message: "Company added successfully", company });
  } catch (error) {
    console.log("create company", error.message);
    res.status(500).json({ message: "Internal sever error" });
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
