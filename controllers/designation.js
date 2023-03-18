const Designation = require("../models/Designation");
const Joi = require("joi");

const designationValidation = Joi.object({
  name: Joi.string().min(3).required(),
});

exports.addDesignation = async (req, res) => {
  try {
    const validateRequest = designationValidation.validate(req.body);
    if (validateRequest.error) {
      return res.status(400).json({ status: "fail", message: validateRequest.error.message });
    }
    const designation = new Designation({
      name: req.body.name,
      createdBy: req.user._id,
      company: req.user.company._id,
    });
    const result = await (await designation.save()).populate([
      "company",
      "createdBy",
    ]);
    res.status(200).json({ message: "Designation added successfully", designation: result });
  } catch (error) {
    console.log("error in adding designation", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllDesignation = async (req, res) => {
  try {
    const designations = await Designation.find({ company: req.user.company._id }).populate([
      "company",
      "createdBy",
      "updatedBy"
    ]);
    if (!designations) {
      return res.status(404).json({ message: "No designation found" });
    }
    res.status(200).json({ designations });
  } catch (error) {
    console.log("error in getting all designation");
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id);
    if (!designation) {
      return res.status(404).json({ message: "Designation not found" });
    }
    res.status(200).json({ designation });
  } catch (error) {
    console.log("error in getting single designation");
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndDelete(req.params.id);
    if (!designation) {
      return res.status(404).json({ message: "Designation not found" });
    }
    res.status(200).json({ message: "Designation deleted successfully", designation });
  } catch (error) {
    console.log("error in deleting designation", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateDesignation = async (req, res) => {
  try {
    const validateRequest = designationValidation.validate(req.body);
    if (validateRequest.error) {
      return res.status(400).json({ status: "fail", message: validateRequest.error.message });
    }
    const allowedUpdates = ["name", "updatedBy"];
    const updates = Object.keys(req.body);
    updates.every((update) => {
      if (!allowedUpdates.includes(update)) {
        return res.status(400).json({ message: `${update} is not allowed to update` });
      }
    });
    const designation = await Designation.findById(req.params.id);
    if (!designation) {
      return res.status(404).json({ message: "Designation not found" });
    }
    updates.forEach((update) => (designation[update] = req.body[update]));
    let result = await (await designation.save()).populate("updatedBy");
    res.status(200).json({ message: "Designation updated successfully", designation: result });
  } catch (error) {
    console.log("error in updating designation", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
