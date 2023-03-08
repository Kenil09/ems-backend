// const http = require('http');
// const socketio = require('socket.io');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   // Set CORS headers
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Request-Method', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
//   res.setHeader('Access-Control-Allow-Headers', '*');

//   if (req.method === 'OPTIONS') {
//     res.writeHead(200);
//     res.end();
//     return;
//   }

//   // Send a JSON response
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'application/json');
//   const data = {
//     message: 'Hello World'
//   };
//   res.end(JSON.stringify(data));
// });

// // Create Socket.io server and listen on same port as HTTP server
// const io = socketio(server);

// // Handle Socket.io connections
// io.on('connection', (socket) => {
//   console.log('A client connected');

//   // Handle incoming messages
//   socket.on('message', (data) => {
//     console.log('Received message:', data);

//     // Broadcast the message to all connected clients
//     socket.broadcast.emit('message', data);
//   });

//   // Handle disconnections
//   socket.on('disconnect', () => {
//     console.log('A client disconnected');
//   });
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set up CORS
app.use(cors());

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

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
