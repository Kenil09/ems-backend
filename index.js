const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { createServer } = require("http");
require("dotenv").config();
const sockethandler = require("./utils/socket");
const connectDB = require("./utils/db/mongoose");
//routes
const userRoutes = require("./routes/user");
const departmentRoutes = require("./routes/department");
const companyRoutes = require("./routes/company");
const designationRoutes = require("./routes/designation");
const shiftRoutes = require("./routes/shift");
const attendenceRoutes = require("./routes/attendence");
const taskRoutes = require("./routes/tasks");
const notificationRoutes = require("./routes/notification");
const leaveRoutes = require("./routes/Leave");
const { verifyToken } = require("./middleware/auth");

connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.frontEnd],
  },
});

io.on("connection", async (socket) => {
  sockethandler(socket);
});

app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/department", verifyToken, departmentRoutes);
app.use("/designation", verifyToken, designationRoutes);
app.use("/company", companyRoutes);
app.use("/shift", shiftRoutes);
app.use("/attendence", attendenceRoutes);
app.use("/task", taskRoutes);
app.use("/notification", notificationRoutes);
app.use("/leave", leaveRoutes);

const port = process.env.PORT || 3001;

httpServer.listen(port, () => console.log(`Server listening on port ${port}`));

module.exports = { app };
