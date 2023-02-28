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
  },
  {
    timestamps: true,
  }
);

module.exports = model("Department", departmentSchema);
