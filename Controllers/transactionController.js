const Transaction = require("../Models/Transaction");
const Lawyer = require("../Models/Lawyer.Model");
const User = require("../Models/User.Model");
const Booking = require("../Models/Booking");

const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    const enrichedTransactions = await Promise.all(
      transactions.map(async (t) => {
        const lawyer = await Lawyer.findOne({ lawyerId: t.lawyerId });
        return {
          ...t._doc,
          lawyer: { name: lawyer?.name || "Unknown", lawyerId: t.lawyerId },
        };
      })
    );

    res.json(enrichedTransactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLawyerBookingHistory = async (req, res) => {
  const { lawyerId } = req.params;

  try {
    // 1. Get all bookings for the given lawyerId
    const bookings = await Booking.find({ lawyerId }).sort({ createdAt: -1 });

    // 2. Enrich each booking with user and transaction details
    const enriched = await Promise.all(bookings.map(async (booking) => {
      // Find the user by userId (custom ID, not _id)
      const user = await User.findOne({ userId: booking.userId });

      // Get related transaction if exists (based on userId, lawyerId, and amount)
      const transaction = await Transaction.findOne({
        userId: booking.userId,
        lawyerId: booking.lawyerId,
        amount: booking.amount
      });

      return {
        ...booking._doc,
        user: {
          userId: user?.userId || 'Unknown',
          name: user?.name || 'Unknown',
          email: user?.email || '',
          phone: user?.phone || ''
        },
        transaction: transaction
          ? {
              transactionId: transaction._id,
              amount: transaction.amount,
              status: transaction.status,
              paymentId: transaction.paymentId,
              createdAt: transaction.createdAt
            }
          : null
      };
    }));

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error fetching booking history:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserTransactions,
  getLawyerBookingHistory,
};
