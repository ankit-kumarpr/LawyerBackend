const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const app = require("./app"); // ✅ already has routes defined
const port = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ✅ Inject io into each request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Socket.io events
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join-user", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("join-lawyer", (lawyerId) => {
    socket.join(lawyerId);
    console.log(`Lawyer ${lawyerId} joined room`);
  });

  socket.on("join-booking", (bookingId) => {
    socket.join(bookingId);
    console.log(`Client joined booking: ${bookingId}`);
  });

  socket.on("chat-message", (data) => {
    io.to(data.bookingId).emit("new-message", data);
  });

  socket.on("initiate-call", (data) => {
    io.to(data.lawyerId).emit("incoming-call", {
      bookingId: data.bookingId,
      mode: data.mode,
      user: data.user
    });
  });

  socket.on("call-response", (data) => {
    io.to(data.bookingId).emit("call-status", {
      status: data.status,
      lawyerId: data.lawyerId
    });
  });

  socket.on("webrtc-signal", (data) => {
    socket.to(data.target).emit("webrtc-signal", {
      sender: data.sender,
      signal: data.signal
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
