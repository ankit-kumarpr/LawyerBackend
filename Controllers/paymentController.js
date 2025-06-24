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
    const { lawyerId, mode, userId } = req.body;

    console.log("Received Data:", { lawyerId, mode, userId });

    
    const lawyer = await Lawyer.findOne({ lawyerId });  

    console.log("Lawyer Data:", lawyer);

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
      userId,
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
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;
    
    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ 
        error:true,
        message: 'Invalid signature'
     });
    }

    // Update booking status
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'success',
        status: 'requested'
      },
      { new: true }
    ).populate('lawyer', 'name email', { lawyerId: booking.lawyerId });

    // Create transaction record
    const transaction = new Transaction({
      userId: booking.userId,
      lawyerId: booking.lawyerId,
      amount: booking.amount,
      paymentId: razorpay_payment_id,
      status: 'success'
    });

    await transaction.save();

    // Emit real-time notification to lawyer
    req.io.to(booking.lawyerId).emit('new-booking', {
      booking,
      user: req.user
    });

   return res.status(200).json({
error:false,
     success: true, 
     booking 
    });
  } catch (err) {
    res.status(500).json({ 
        error: truea,
        message:"Internal server error"
     });
  }
};




//

module.exports={
    createOrder,
    verifyPayment
}
