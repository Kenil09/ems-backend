const Shift = require("../models/Shift");
const Joi = require("joi");
const mongoose = require("mongoose");

const createShiftValidation = Joi.object({
  name: Joi.string().required(),
  startTime: Joi.string()
    .length(5)
    .regex(/(\d){2}:(\d){2}/)
    .required(),
  endTime: Joi.string()
    .length(5)
    .regex(/(\d){2}:(\d){2}/)
    .required(),
  weekDefinition: Joi.array()
    .items(
      Joi.object({
        sunday: Joi.boolean().required(),
        monday: Joi.boolean().required(),
        tuesday: Joi.boolean().required(),
        wednesday: Joi.boolean().required(),
        thursday: Joi.boolean().required(),
        friday: Joi.boolean().required(),
        saturday: Joi.boolean().required(),
      })
    )
    .length(5)
    .required(),
  // margin: Joi.string().required(),
  // marginBefore: Joi.string().when("margin", { is: true, then: Joi.string().required() }),
  // marginAfter: Joi.string().when("margin", { is: true, then: Joi.string().required() }),
  // company: Joi.string().required(),
  applicableDepartments: Joi.array().items(Joi.string().required()).required(),
});

exports.addShift = async (req, res) => {
  try {
    const validateRequest = createShiftValidation.validate(req.body);
    if (validateRequest.error) {
      console.log(validateRequest.error.details);
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const shift = new Shift({
      ...req.body,
      createdBy: req.user._id,
      company: req.user.company._id,
      type: "custom",
    });
    const result = await (
      await shift.save()
    ).populate(["company", "applicableDepartments", "createdBy"]);
    return res
      .status(200)
      .json({ message: "Shift created succesfully", shift: result });
  } catch (error) {
    console.log("create shift", error.message, error);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.getCompanyShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ company: req.params.id }).populate([
      "company",
      "createdBy",
      "applicableDepartments",
      "updatedBy",
    ]);
    res.status(200).json({ shifts });
  } catch (error) {
    console.log("Get company shifts", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.deleteShift = async (req, res) => {
  try {
    const id = mongoose.Types.ObjectId(req.params.id);
    const shift = await Shift.findOneAndDelete(id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }
    res.status(200).json({ message: "shift deleted successfully", shift });
  } catch (error) {
    console.log("Get company shifts", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.updateShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: "Unable to find the shift" });
    }
    const allowedUpdates = [
      "name",
      "startTime",
      "endTime",
      "weekDefinition",
      "applicableDepartments",
    ];
    const updates = Object.keys(req.body);
    updates.every((update) => {
      if (!allowedUpdates.includes(update)) {
        return res.status(401).json({ message: `${update} is not allowed` });
      }
    });
    updates.forEach((update) => (shift[update] = req.body[update]));
    let result = await (
      await shift.save()
    ).populate(["company", "applicableDepartments", "createdBy", "updatedBy"]);
    res
      .status(200)
      .json({ message: "Shift updated successfully", shift: result });
  } catch (error) {
    console.log("Get company shifts", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};
