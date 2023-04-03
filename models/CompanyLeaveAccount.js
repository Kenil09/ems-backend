const { model, Schema } = require("mongoose");

const CompanyLeaveSchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    casualLeave: { type: Number, default: 15, required: true },
    earnedLeave: { type: Number, default: 15, required: true },
    leaveWithoutPay: { type: Number, default: 12, required: true },
    sabbaticalLeave: { type: Number, default: 12, required: true },
    sickLeave: { type: Number, default: 12, required: true },
  },
  { timestamps: true }
);

module.exports = model("CompanyLeaveAccount", CompanyLeaveSchema);
