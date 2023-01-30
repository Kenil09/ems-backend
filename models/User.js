const { model, Schema } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["employee", "manager", "admin", "superAdmin"],
      required: true,
    },
    designation: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeDesignation",
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

module.exports = model("User", userSchema);
