module.exports = (socket) => {
  socket.on("broadcastNotification", (data) => {
    socket.broadcast.emit("fetchNotification");
  });
  socket.on("broadcastComment", (data) => {
    socket.broadcast.emit("fetchComment");
  });
};
