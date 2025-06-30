const dotenv = require("dotenv");
dotenv.config();
const crypto = require('crypto');
const Booking = require('../Models/Booking');
const Transaction = require('../Models/Transaction');
const Lawyer = require('../Models/Lawyer.Model');
const User = require('../Models/User.Model');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: "rzp_test_mcwl3oaRQerrOW",  // wrap in quotes
  key_secret: "N3hp4Pr3imA502zymNNyIYGI"
});

const createOrder = async (req, res) => {
  try {
    const { lawyerId, mode } = req.body;

    // console.log("Received Data:", { lawyerId, mode });

    
    const lawyer = await Lawyer.findOne({ lawyerId });  

    // console.log("Lawyer Data:", lawyer);

    if (!lawyer) {
      return res.status(404).json({
        error: true,
        message: "Lawyer not Found"
      });
    }

    // Create order on Razorpay
    const options = {
      amount: lawyer.consultation_fees * 100, // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    console.log("Razorpay Order:", order);

    // Save booking to DB
    const booking = new Booking({
      userId: req.user.userId,
      lawyerId,
      mode,
      amount: lawyer.consultation_fees,
      paymentId: order.id,
    });

    await booking.save();

    return res.status(200).json({
      success: true,
      order,
      booking
    });

  } catch (err) {
    console.error("Error in createOrder:", err.message);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error"
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // ✅ Step 1: Verify Razorpay signature
    const generated_signature = crypto
      .createHmac("sha256", "N3hp4Pr3imA502zymNNyIYGI") // Replace with your actual Razorpay key_secret from .env
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        error: true,
        message: "Invalid signature",
      });
    }

    // ✅ Step 2: Update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "success",
        status: "requested",
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        error: true,
        message: "Booking not found",
      });
    }

    // ✅ Step 3: Manually fetch lawyer info using custom `lawyerId`
    const lawyer = await Lawyer.findOne(
      { lawyerId: booking.lawyerId },
      "name email"
    );

    const populatedBooking = {
      ...booking._doc,
      lawyer: lawyer || null,
    };

    // ✅ Step 4: Create a transaction record
    const transaction = new Transaction({
      userId: booking.userId,
      lawyerId: booking.lawyerId,
      amount: booking.amount,
      paymentId: razorpay_payment_id,
      status: "success",
    });

    await transaction.save();

    // ✅ Step 5: Emit event to lawyer's socket room
    if (req.io) {
      req.io.to(booking.lawyerId).emit("new-booking", {
        booking: populatedBooking,
        user: req.user, // assuming req.user is authenticated user
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      booking: populatedBooking,
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};


//

module.exports={
    createOrder,
    verifyPayment
}
