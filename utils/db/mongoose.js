const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    mongoose.connect(process.env.DB_URL);
    console.log("connected to mongoDB");
  } catch (error) {
    console.error("Error", error.message);
  }
};

module.exports = connectDB;
