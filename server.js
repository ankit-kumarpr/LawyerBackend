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

// const http = require("http");
// const { app, setSocketIO } = require("./app"); // updated import
// const port = process.env.PORT || 3000;

// const socketIo = require("socket.io");

// const server = http.createServer(app);

// // Set up Socket.IO
// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST", "PUT"]
//   }
// });

// // Pass io to app middleware
// setSocketIO(io);

// // Socket.IO connection handling
// io.on("connection", (socket) => {
//   console.log("New client connected");

//   // Join rooms
//   socket.on("join-user", (userId) => {
//     socket.join(userId);
//     console.log(`User ${userId} joined room`);
//   });

//   socket.on("join-lawyer", (lawyerId) => {
//     socket.join(lawyerId);
//     console.log(`Lawyer ${lawyerId} joined room`);
//   });

//   socket.on("join-booking", (bookingId) => {
//     socket.join(bookingId);
//     console.log(`Client joined booking: ${bookingId}`);
//   });

//   // Chat messages
//   socket.on("chat-message", (data) => {
//     io.to(data.bookingId).emit("new-message", data);
//   });

//   // Call initiation
//   socket.on("initiate-call", (data) => {
//     io.to(data.lawyerId).emit("incoming-call", {
//       bookingId: data.bookingId,
//       mode: data.mode,
//       user: data.user,
//     });
//   });

//   // Call response
//   socket.on("call-response", (data) => {
//     io.to(data.bookingId).emit("call-status", {
//       status: data.status,
//       lawyerId: data.lawyerId,
//     });
//   });

//   // WebRTC signaling
//   socket.on("webrtc-signal", (data) => {
//     socket.to(data.target).emit("webrtc-signal", {
//       sender: data.sender,
//       signal: data.signal,
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

// // Start the server
// server.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


// ----------------------------------------second server end -----------------------------------------


// const http = require("http");
// const { app, setSocketIO } = require("./app");
// const port = process.env.PORT || 3000;
// const socketIo = require("socket.io");

// const server = http.createServer(app);

// // Set up Socket.IO with enhanced configuration
// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Authorization"],
//     credentials: true,
//   },
//   pingTimeout: 60000,
//   pingInterval: 25000,
// });

// // Pass io to app middleware
// setSocketIO(io);

// // Track connected users and lawyers
// const connectedUsers = new Map();
// const connectedLawyers = new Map();

// // Socket.IO connection handling
// io.on("connection", (socket) => {
//   console.log(`New client connected: ${socket.id}`);

//   // Join rooms with validation
//   socket.on("join-user", (userId) => {
//     if (!userId) {
//       console.warn("Attempted to join user room without userId");
//       return;
//     }
//     socket.join(userId);
//     connectedUsers.set(userId, socket.id);
//     console.log(`User ${userId} joined room`);
//   });

//   socket.on("join-lawyer", (lawyerId) => {
//     if (!lawyerId) {
//       console.warn("Attempted to join lawyer room without lawyerId");
//       return;
//     }
//     socket.join(lawyerId);
//     connectedLawyers.set(lawyerId, socket.id);
//     console.log(`Lawyer ${lawyerId} joined room`);
//   });

//   socket.on("join-booking", (bookingId) => {
//     if (!bookingId) {
//       console.warn("Attempted to join booking room without bookingId");
//       return;
//     }
//     socket.join(bookingId);
//     console.log(`Client joined booking: ${bookingId}`);
//   });

//   // Handle new booking notifications
//   socket.on("new-booking-notification", (data) => {
//     try {
//       const { lawyerId, bookingId, userId, mode, amount } = data;

//       if (!lawyerId || !bookingId) {
//         console.warn("Invalid booking notification data");
//         return;
//       }

//       // Emit to lawyer's room
//       io.to(lawyerId).emit("booking-notification", {
//         bookingId,
//         userId,
//         mode,
//         amount,
//         timestamp: new Date().toISOString(),
//       });

//       // Also emit to booking room for real-time updates
//       io.to(bookingId).emit("booking-update", {
//         status: "confirmed",
//         lawyerId,
//         userId,
//       });

//       console.log(
//         `Booking notification sent for booking ${bookingId} to lawyer ${lawyerId}`
//       );
//     } catch (error) {
//       console.error("Error handling booking notification:", error);
//     }
//   });

//   // Handle chat initiation
//   socket.on("user-started-chat", (data) => {
//     const { userId, lawyerId, bookingId, mode } = data;

//     // Verify required fields
//     if (!userId || !lawyerId || !bookingId) {
//       console.warn("Invalid chat initiation data");
//       return;
//     }

//     // Check if lawyer is connected
//     if (!connectedLawyers.has(lawyerId)) {
//       console.log(`Lawyer ${lawyerId} is not currently connected`);
//       // You might want to store this as a pending notification
//     }

//     io.to(lawyerId).emit("incoming-session-request", {
//       bookingId,
//       userId,
//       mode,
//       timestamp: new Date().toISOString(),
//     });

//     console.log(
//       `Session request sent from user ${userId} to lawyer ${lawyerId}`
//     );
//   });

//   // Chat messages with validation
//   socket.on("chat-message", (data) => {
//     if (!data.bookingId || !data.senderId || !data.message) {
//       console.warn("Invalid chat message format");
//       return;
//     }

//     // Add timestamp and message status
//     const messageWithMeta = {
//       ...data,
//       timestamp: new Date().toISOString(),
//       status: "delivered",
//     };

//     io.to(data.bookingId).emit("new-message", messageWithMeta);

//     // Optional: Store message in database here
//   });

//   // Call initiation with validation
//   socket.on("initiate-call", (data) => {
//     if (!data.lawyerId || !data.bookingId) {
//       console.warn("Invalid call initiation data");
//       return;
//     }

//     io.to(data.lawyerId).emit("incoming-call", {
//       bookingId: data.bookingId,
//       mode: data.mode,
//       user: data.user,
//       timestamp: new Date().toISOString(),
//     });
//   });

//   // Call response handling
//   socket.on("call-response", (data) => {
//     if (!data.bookingId || !data.status) {
//       console.warn("Invalid call response data");
//       return;
//     }

//     io.to(data.bookingId).emit("call-status", {
//       status: data.status,
//       lawyerId: data.lawyerId,
//       timestamp: new Date().toISOString(),
//     });
//   });

//   // WebRTC signaling with validation
//   socket.on("webrtc-signal", (data) => {
//     if (!data.target || !data.sender || !data.signal) {
//       console.warn("Invalid WebRTC signal data");
//       return;
//     }

//     socket.to(data.target).emit("webrtc-signal", {
//       sender: data.sender,
//       signal: data.signal,
//       timestamp: new Date().toISOString(),
//     });
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     console.log(`Client disconnected: ${socket.id}`);

//     // Clean up connected users/lawyers maps
//     for (let [userId, socketId] of connectedUsers.entries()) {
//       if (socketId === socket.id) {
//         connectedUsers.delete(userId);
//         console.log(`User ${userId} disconnected`);
//       }
//     }

//     for (let [lawyerId, socketId] of connectedLawyers.entries()) {
//       if (socketId === socket.id) {
//         connectedLawyers.delete(lawyerId);
//         console.log(`Lawyer ${lawyerId} disconnected`);
//       }
//     }
//   });
// });

// // Start the server
// server.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


//-----------------------------server 3rd .js ------------------------------

// ✅ SERVER (Socket.IO Backend with Enhanced Notifications)

const http = require("http");
const { app, setSocketIO } = require("./app");
const port = process.env.PORT || 3000;
const socketIo = require("socket.io");

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

setSocketIO(io);

const connectedUsers = new Map();
const connectedLawyers = new Map();

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("join-user", (userId) => {
    if (!userId) return;
    socket.join(userId);
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined room`);
    socket.emit("joined-user-room", { userId });
  });
// console.log(`join lawyer lawyer id outside,${lawyerId}`);
  socket.on("join-lawyer", (lawyerId) => {
    console.log(`join lawyer lawyer id inside,${lawyerId}`);
    if (!lawyerId) return;
    socket.join(lawyerId);
    connectedLawyers.set(lawyerId, socket.id);
    console.log(`Lawyer ${lawyerId} joined room`);
    socket.emit("joined-lawyer-room", { lawyerId });
  });

  socket.on("join-booking", (bookingId) => {
    if (!bookingId) return;
    socket.join(bookingId);
    console.log(`Client joined booking: ${bookingId}`);
  });

  socket.on("new-booking-notification", (data) => {
    console.log("Booking data",data);
    try {
      const { lawyerId, bookingId, userId, mode, amount,name } = data;
      if (!lawyerId || !bookingId) return;

      if (!connectedLawyers.has(lawyerId)) {
        console.warn(`⚠ Lawyer ${lawyerId} is NOT connected`);
      } else {
        console.log(`✅ Sending booking notification to lawyer ${lawyerId}`);
      }

      io.to(lawyerId).emit("booking-notification", {
        bookingId,
        userId,
        mode,
        amount,
        name,
        timestamp: new Date().toISOString(),
      });

      io.to(bookingId).emit("booking-update", {
        status: "confirmed",
        lawyerId,
        userId,
      });

      console.log(`Booking notification sent for booking ${bookingId} to lawyer ${lawyerId}`);
    } catch (error) {
      console.error("Error handling booking notification:", error);
    }
  });

  socket.on("user-started-chat", (data) => {
    const { userId, lawyerId, bookingId, mode } = data;
    if (!userId || !lawyerId || !bookingId) return;

    if (!connectedLawyers.has(lawyerId)) {
      console.warn(`⚠ Lawyer ${lawyerId} is not currently connected`);
    }

    io.to(lawyerId).emit("incoming-session-request", {
      bookingId,
      userId,
      mode,
      timestamp: new Date().toISOString(),
    });

    console.log(`Session request sent from user ${userId} to lawyer ${lawyerId}`);
  });

  socket.on("chat-message", (data) => {
    if (!data.bookingId || !data.senderId || !data.message) return;

    const messageWithMeta = {
      ...data,
      timestamp: new Date().toISOString(),
      status: "delivered",
    };

    io.to(data.bookingId).emit("new-message", messageWithMeta);
  });

  socket.on("initiate-call", (data) => {
    if (!data.lawyerId || !data.bookingId) return;

    io.to(data.lawyerId).emit("incoming-call", {
      bookingId: data.bookingId,
      mode: data.mode,
      user: data.user,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("call-response", (data) => {
    if (!data.bookingId || !data.status) return;

    io.to(data.bookingId).emit("call-status", {
      status: data.status,
      lawyerId: data.lawyerId,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("webrtc-signal", (data) => {
    if (!data.target || !data.sender || !data.signal) return;

    socket.to(data.target).emit("webrtc-signal", {
      sender: data.sender,
      signal: data.signal,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);

    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    }

    for (let [lawyerId, socketId] of connectedLawyers.entries()) {
      if (socketId === socket.id) {
        connectedLawyers.delete(lawyerId);
        console.log(`Lawyer ${lawyerId} disconnected`);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
