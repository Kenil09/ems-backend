const { model, Schema } = require("mongoose");

const attendenceSchema = new Schema(
  {
    checkIn: {
      type: Schema.Types.Date,
      required: true,
    },
    checkOut: {
      type: Schema.Types.Date,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    manual: {
      type: Schema.Types.Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Attendence", attendenceSchema);
