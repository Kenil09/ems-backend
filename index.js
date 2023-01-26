const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./utils/db/mongoose");
//routes
const userRoutes = require("./routes/user");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running in port ${port}`);
});
