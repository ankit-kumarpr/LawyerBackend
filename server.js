const http = require("http");
const { app, setSocketIO } = require("./app");
const socketIo = require("socket.io");

const port = process.env.PORT || 3000;
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

// Track connections
const connectedUsers = new Map();
const connectedLawyers = new Map();

io.on("connection", (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  // Debug all events
  socket.onAny((event, payload) => {
    console.log(`📡 [SOCKET EVENT] ${event}:`, payload);
  });

  // Join rooms
  socket.on("join-user", (userId) => {
    if (!userId) return;
    socket.join(userId);
    connectedUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} joined room`);
    socket.emit("joined-user-room", { userId });
  });

  socket.on("join-lawyer", (lawyerId) => {
    if (!lawyerId) return;
    socket.join(lawyerId);
    connectedLawyers.set(lawyerId, socket.id);
    console.log(`🧑‍⚖ Lawyer ${lawyerId} joined room`);
    socket.emit("joined-lawyer-room", { lawyerId });
  });

  socket.on("join-booking", (bookingId) => {
    if (!bookingId) return;
    socket.join(bookingId);
    console.log(`📂 Client joined booking: ${bookingId}`);
  });

  // Booking notification to lawyer
  socket.on("new-booking-notification", (data) => {
    const { lawyerId, bookingId, userId, mode, amount } = data;
    if (!lawyerId || !bookingId) return;

    if (!connectedLawyers.has(lawyerId)) {
      console.warn(`⚠ Lawyer ${lawyerId} is NOT connected`);
    } else {
      console.log(`📩 Sending booking notification to lawyer ${lawyerId}`);
    }

    io.to(lawyerId).emit("booking-notification", {
      bookingId,
      userId,
      mode,
      amount,
      timestamp: new Date().toISOString(),
    });

    io.to(bookingId).emit("booking-update", {
      status: "confirmed",
      lawyerId,
      userId,
    });

    console.log(`📤 Booking notification sent for booking ${bookingId} to lawyer ${lawyerId}`);
  });

  // Session request to lawyer
  socket.on("user-started-chat", (data) => {
    const { userId, lawyerId, bookingId, mode } = data;
    if (!userId || !lawyerId || !bookingId) return;

    io.to(lawyerId).emit("incoming-session-request", {
      bookingId,
      userId,
      mode,
      timestamp: new Date().toISOString(),
    });

    console.log(`📤 Session request sent from user ${userId} to lawyer ${lawyerId}`);
  });

  // ✅ Lawyer accepts booking
  socket.on("booking-accepted", (data) => {
    const { bookingId, lawyerId, userId } = data;
    if (!bookingId || !lawyerId || !userId) return;

    const response = {
      bookingId,
      lawyerId,
      userId,
      timestamp: new Date().toISOString(),
    };

    io.to(bookingId).emit("booking-accepted", response);
    io.to(userId).emit("booking-accepted", response);

    console.log(`✅ Booking accepted event emitted for booking: ${bookingId}`);

    // ✅ Emit session-started immediately after acceptance
    io.to(bookingId).emit("session-started", {
      bookingId,
      duration: 900, // 15 minutes = 900 seconds
      startedAt: new Date().toISOString()
    });

    console.log(`🚀 session-started emitted to room: ${bookingId}`);
  });

  // Chat message relay
  socket.on("chat-message", (data) => {
    const { bookingId, senderId, message } = data;
    if (!bookingId || !senderId || !message) return;

    const messageWithMeta = {
      ...data,
      timestamp: new Date().toISOString(),
      status: "delivered",
    };

    io.to(bookingId).emit("new-message", messageWithMeta);
  });

  // Call events
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

  // WebRTC signaling
  socket.on("webrtc-signal", (data) => {
    if (!data.target || !data.sender || !data.signal) return;

    socket.to(data.target).emit("webrtc-signal", {
      sender: data.sender,
      signal: data.signal,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`❎ Client disconnected: ${socket.id}`);

    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`👤 User ${userId} disconnected`);
      }
    }

    for (let [lawyerId, socketId] of connectedLawyers.entries()) {
      if (socketId === socket.id) {
        connectedLawyers.delete(lawyerId);
        console.log(`🧑‍⚖ Lawyer ${lawyerId} disconnected`);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
