const { model, Schema } = require("mongoose");
const bcrypt = require("bcryptjs");

const workExperience = new Schema({
  previousCompany: { type: String, required: true },
  jobTitle: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  jobDescription: { type: String },
});

const educationDetails = new Schema({
  university: { type: String, required: true },
  degree: { type: String, required: true },
  dateOfCompletion: { type: Date, required: true },
});

const userSchema = new Schema(
  {
    // basic information
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    nickName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // work information
    designation: {
      type: Schema.Types.ObjectId,
      ref: "Designation",
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "teamMember", "teamIncharge", "manager"],
      required: true,
    },
    location: {
      type: String,
    },
    employeeType: {
      type: String,
      enum: ["permanent", "onContract", "temporary", "trainee"],
    },
    joiningDate: {
      type: Date,
      default: Date.now(),
    },
    reportingManager: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // Personal Information
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    birthDate: {
      type: Date,
    },
    maritalStatus: {
      type: Schema.Types.String,
    },
    aboutMeInfo: {
      type: String,
    },
    // Identity Info
    aadharNumber: {
      type: String,
      minLength: 12,
      maxLength: 12,
    },
    // Contact Info
    phoneNumber: {
      type: String,
    },
    personalContact: {
      email: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    // work experience
    workExperience: {
      type: [workExperience],
    },
    // Education details
    educationDetails: {
      type: [educationDetails],
    },
    // system required
    password: {
      type: String,
      minLength: 6,
    },
    isActive: {
      type: Schema.Types.Boolean,
      required: true,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    securityCode: {
      type: Schema.Types.Number,
    },
    owner: {
      type: Schema.Types.Boolean,
    },
    profilePicture: {
      type: Schema.Types.String,
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
