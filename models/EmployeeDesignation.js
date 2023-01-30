const { model, Schema } = require("mongoose");

const employeeRoleSchema = new Schema(
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
  },
  {
    timestamps: true,
  }
);

module.exports = model("EmployeeDesignation", employeeRoleSchema);
