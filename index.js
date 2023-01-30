const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./utils/db/mongoose");
//routes
const userRoutes = require("./routes/user");
const departmentRoutes = require("./routes/department");
const companyRoutes = require("./routes/company");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/department", departmentRoutes);
app.use("/company", companyRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running in port ${port}`);
});
