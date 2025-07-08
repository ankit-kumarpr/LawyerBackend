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
  pingTimeout: 120000, // 2 minutes
  pingInterval: 30000, // every 30s
});

// Make socket instance available globally
setSocketIO(io);

// Auth middleware (JWT validation can be added)
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    console.warn("❌ Missing authentication token");
    return next(new Error("Missing authentication"));
  }
  next();
});

// In-memory stores
const connectedUsers = new Map();
const connectedLawyers = new Map();
const activeSessions = new Map(); // 🔄 Re-emit session-started if user rejoins

io.on("connection", (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  socket.onAny((event, payload) => {
    console.log(`📡 [EVENT] ${event}:`, payload);
  });

  // Join user room
  socket.on("join-user", (userId) => {
    if (!userId) return;
    socket.join(userId);
    connectedUsers.set(userId, socket.id);
    socket.emit("joined-user-room", { userId });
    console.log(`👤 User ${userId} joined`);
  });

  // Join lawyer room
  socket.on("join-lawyer", (lawyerId) => {
    if (!lawyerId) return;
    socket.join(lawyerId);
    connectedLawyers.set(lawyerId, socket.id);
    socket.emit("joined-lawyer-room", { lawyerId });
    console.log(`🧑‍⚖ Lawyer ${lawyerId} joined`);
  });

  // Join booking room
  socket.on("join-booking", (bookingId) => {
    if (!bookingId) return;
    socket.join(bookingId);
    console.log(`📂 Joined booking: ${bookingId}`);

    // If session already started, re-emit
    if (activeSessions.has(bookingId)) {
      const sessionData = activeSessions.get(bookingId);
      socket.emit("session-started", sessionData);
      console.log(`🔁 Re-sent session-started for booking: ${bookingId}`);
    }
  });

  // Notify lawyer of new booking
  socket.on("new-booking-notification", ({ lawyerId, bookingId, userId, mode, amount }) => {
    if (!lawyerId || !bookingId) return;

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

    console.log(`📤 Booking ${bookingId} notified to lawyer ${lawyerId}`);
  });

  // User initiates session
  socket.on("user-started-chat", ({ userId, lawyerId, bookingId, mode }) => {
    if (!userId || !lawyerId || !bookingId) return;

    io.to(lawyerId).emit("incoming-session-request", {
      bookingId,
      userId,
      mode,
      timestamp: new Date().toISOString(),
    });

    console.log(`📤 Session request from user ${userId} to lawyer ${lawyerId}`);
  });

  // Lawyer accepts session
  socket.on("booking-accepted", ({ bookingId, lawyerId, userId }) => {
    if (!bookingId || !lawyerId || !userId) return;

    const sessionData = {
      bookingId,
      duration: 900,
      startedAt: new Date().toISOString(),
    };

    activeSessions.set(bookingId, sessionData);

    io.to(bookingId).emit("session-started", sessionData);
    io.to(userId).emit("booking-accepted", { bookingId, lawyerId, userId });

    console.log(`🚀 session-started emitted for booking: ${bookingId}`);
  });

  // Messaging
  socket.on("chat-message", (data) => {
    const { bookingId, senderId, message } = data;
    if (!bookingId || !senderId || !message) return;

    const msg = {
      ...data,
      timestamp: new Date().toISOString(),
      status: "delivered",
    };

    io.to(bookingId).emit("new-message", msg);
  });

  // Session end
  socket.on("end-session", ({ bookingId }) => {
    if (!bookingId) return;

    io.to(bookingId).emit("session-ended", { bookingId });
    activeSessions.delete(bookingId);

    console.log(`🛑 session-ended emitted for booking: ${bookingId}`);
  });

  // Call initiation
  socket.on("initiate-call", ({ lawyerId, bookingId, mode, user }) => {
    if (!lawyerId || !bookingId) return;

    io.to(lawyerId).emit("incoming-call", {
      bookingId,
      mode,
      user,
      timestamp: new Date().toISOString(),
    });
  });

  // Call response
  socket.on("call-response", ({ bookingId, status, lawyerId }) => {
    if (!bookingId || !status) return;

    io.to(bookingId).emit("call-status", {
      status,
      lawyerId,
      timestamp: new Date().toISOString(),
    });
  });

  // WebRTC signaling
  socket.on("webrtc-signal", ({ target, sender, signal }) => {
    if (!target || !sender || !signal) return;

    socket.to(target).emit("webrtc-signal", {
      sender,
      signal,
      timestamp: new Date().toISOString(),
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`❎ Client disconnected: ${socket.id}`);

    for (const [userId, sockId] of connectedUsers) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`👤 User ${userId} disconnected`);
      }
    }

    for (const [lawyerId, sockId] of connectedLawyers) {
      if (sockId === socket.id) {
        connectedLawyers.delete(lawyerId);
        console.log(`🧑‍⚖ Lawyer ${lawyerId} disconnected`);
      }
    }
  });
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
