// const http = require("http");
// const app = require("./app");
// const port = process.env.PORT || 3000;

// const socketIo = require('socket.io');

// const server = http.createServer(app);

// // Socket.IO setup

// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST","PUT"]
//   }
// });

// // Socket.io connection
// io.on('connection', (socket) => {
//   console.log('New client connected');
  
//   // Join user-specific room
//   socket.on('join-user', (userId) => {
//     socket.join(userId);
//     console.log(`User ${userId} joined room`);
//   });
  
//   // Join lawyer-specific room
//   socket.on('join-lawyer', (lawyerId) => {
//     socket.join(lawyerId);
//     console.log(`Lawyer ${lawyerId} joined room`);
//   });
  
//   // Join booking room
//   socket.on('join-booking', (bookingId) => {
//     socket.join(bookingId);
//     console.log(`Client joined booking: ${bookingId}`);
//   });
  
//   // Handle chat messages
//   socket.on('chat-message', (data) => {
//     io.to(data.bookingId).emit('new-message', data);
//   });
  
//   // Handle call initiation
//   socket.on('initiate-call', (data) => {
//     io.to(data.lawyerId).emit('incoming-call', {
//       bookingId: data.bookingId,
//       mode: data.mode,
//       user: data.user
//     });
//   });
  
//   // Handle call response
//   socket.on('call-response', (data) => {
//     io.to(data.bookingId).emit('call-status', {
//       status: data.status,
//       lawyerId: data.lawyerId
//     });
//   });
  
//   // WebRTC signaling
//   socket.on('webrtc-signal', (data) => {
//     socket.to(data.target).emit('webrtc-signal', {
//       sender: data.sender,
//       signal: data.signal
//     });
//   });
  
//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

// // Attach io to requests
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });




// server.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });






// ---------------------------new server.js------------------

const http = require("http");
const { app, setSocketIO } = require("./app"); // updated import
const port = process.env.PORT || 3000;

const socketIo = require("socket.io");

const server = http.createServer(app);

// Set up Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

// Pass io to app middleware
setSocketIO(io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected");

  // Join rooms
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

  // Chat messages
  socket.on("chat-message", (data) => {
    io.to(data.bookingId).emit("new-message", data);
  });

  // Call initiation
  socket.on("initiate-call", (data) => {
    io.to(data.lawyerId).emit("incoming-call", {
      bookingId: data.bookingId,
      mode: data.mode,
      user: data.user,
    });
  });

  // Call response
  socket.on("call-response", (data) => {
    io.to(data.bookingId).emit("call-status", {
      status: data.status,
      lawyerId: data.lawyerId,
    });
  });

  // WebRTC signaling
  socket.on("webrtc-signal", (data) => {
    socket.to(data.target).emit("webrtc-signal", {
      sender: data.sender,
      signal: data.signal,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
