const Designation = require("../models/Designation");
const Joi = require("joi");

const designationValidation = Joi.object({
  name: Joi.string().min(3).required(),
});

exports.addDesignation = async (req, res) => {
  try {
    const validateRequest = designationValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const designation = new Designation({
      name: req.body.name,
      createdBy: req.user._id,
      company: req.user.company._id,
    });
  } catch (error) {
    console.log("error in adding designation");
    res.status(500).json({ message: "Internal server error" });
  }
};
