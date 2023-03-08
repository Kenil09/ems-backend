const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

require("dotenv").config();
const connectDB = require("./utils/db/mongoose");
//routes
const userRoutes = require("./routes/user");
const departmentRoutes = require("./routes/department");
const companyRoutes = require("./routes/company");

connectDB();


// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('A client connected');

  // Handle incoming messages
  socket.on('message', (data) => {
    console.log('Received message:', data);

    // Broadcast the message to all connected clients
    socket.broadcast.emit('message', data);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});


app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/department", departmentRoutes);
app.use("/company", companyRoutes);

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});