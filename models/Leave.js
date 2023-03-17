const { model, Schema } = require("mongoose");

const Leave = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    FromDate: {
      type: Date,
    },
    ToDate: {
      type: Date,
    },
    LeaveType: {
      type: String,
      enum: [
        "casualLeave",
        "earnedLeave",
        "leaveWithoutPay",
        "sabbaticalLeave",
        "sickLeave",
      ],
      required: true,
    },
    CancelledBy: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "User",
    },
    Reason: {
      type: String,
      default: null,
    },
    Status: {
      type: String,
      enum: ["Approved", "Rejected", "Pending"],
      default: "Pending",
    },
    duration: {
      type: Number,
    },
    CancelledMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Leave", Leave);
