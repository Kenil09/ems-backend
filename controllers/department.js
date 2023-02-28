const Department = require("../models/Department");
const Joi = require("joi");

const departmentValidation = Joi.object({
  name: Joi.string().required(),
  company: Joi.string().required(),
  departmentLead: Joi.string(),
  parentDepartment: Joi.string(),
});

exports.postAddDepartment = async (req, res) => {
  try {
    const validateRequest = departmentValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const department = new Department(req.body);
    const result = await (
      await (await department.save()).populate("departmentLead")
    ).populate("company");
    res
      .status(200)
      .json({ message: "Department added successfully", department: result });
  } catch (error) {
    console.log("create department ", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.getAllDepartment = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("departmentLead")
      .populate("company");
    res.status(200).json({ departments });
  } catch (error) {
    console.log("get department", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate("departmentLead")
      .populate("company");
    res.status(200).json({ department });
  } catch (error) {
    console.log("get single department", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      res.status(404).json({ message: "Department not found" });
    }
    res
      .status(200)
      .json({ department, message: "Department deleted successfully" });
  } catch (error) {
    console.log("delete single department", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const validateRequest = departmentValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const allowedUpdates = ["name", "departmentLead", "parentDepartment"];
    const updates = Object.keys(req.body);
    updates.every((update) => {
      if (!allowedUpdates.includes(update)) {
        return res.status(401).json({ message: `${update} is not allowed` });
      }
    });
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    updates.forEach((update) => (department[update] = req.body[update]));
    let result = await (
      await (await department.save()).populate("company")
    ).populate("departmentLead");
    res
      .status(200)
      .json({ message: "Department updated successfully", department: result });
  } catch (error) {
    console.log("update department", error.message);
    res.status(500).json({ message: "Internal sever error" });
  }
};
