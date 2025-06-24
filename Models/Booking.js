const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  lawyerId: {
    type: String,
    ref: 'Lawyer',
    required: true
  },
  mode: {
    type: String,
    enum: ['chat', 'voice', 'video'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  paymentId: String,
  status: {
    type: String,
    enum: ['requested', 'accepted', 'rejected', 'completed'],
    default: 'requested'
  },
  startTime: Date,
  endTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
