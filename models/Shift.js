const { model, Schema } = require("mongoose");

const shiftSchema = new Schema({
  shiftName: {
    type: String,
    required: true,
  },
  shiftType: {
    type: String,
    enum: ["general", "custom"],
    required: true,
  },
  shiftStartTime: {
    type: String,
    required: true,
  },
  shiftEndTime: {
    type: String,
    required: true,
  },
  //shift-margin remaining
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
