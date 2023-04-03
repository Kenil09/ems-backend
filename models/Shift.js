const { model, Schema } = require("mongoose");

const weekDefinition = new Schema({
  sunday: { type: Schema.Types.Boolean, required: true },
  monday: { type: Schema.Types.Boolean, required: true },
  tuesday: { type: Schema.Types.Boolean, required: true },
  wednesday: { type: Schema.Types.Boolean, required: true },
  thursday: { type: Schema.Types.Boolean, required: true },
  friday: { type: Schema.Types.Boolean, required: true },
  saturday: { type: Schema.Types.Boolean, required: true },
});

const shiftSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["general", "custom"],
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  // margin: {
  //   type: Schema.Types.Boolean,
  //   required: true
  // },
  // marginBefore: {
  //   type: String,
  //   required: false
  // },
  // marginAfter: {
  //   type: String,
  //   required: false
  // },
  weekDefinition: [weekDefinition],
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  applicableDepartments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = model("Shift", shiftSchema);
