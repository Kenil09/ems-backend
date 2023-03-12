const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./utils/db/mongoose");
//routes
const userRoutes = require("./routes/user");
const departmentRoutes = require("./routes/department");
const companyRoutes = require("./routes/company");
const designationRoutes = require("./routes/designation");
const Leave = require('./routes/Leave');
const { verifyToken } = require("./middleware/auth");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/department", verifyToken, departmentRoutes);
app.use("/designation", verifyToken, designationRoutes);
app.use("/company", companyRoutes);
app.use("/leave",Leave);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running in port ${port}`);
});
