const { model, Schema } = require("mongoose");

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    departmentLead: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    parentDepartment: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Department", departmentSchema);
