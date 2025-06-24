const dotenv = require("dotenv");
dotenv.config();
const crypto = require('crypto');
const Booking = require('../Models/Booking');
const Transaction = require('../Models/Transaction');
const Lawyer = require('../Models/Lawyer.Model');
const User = require('../Models/User.Model');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (req, res) => {
  try {
    const { lawyerId, mode } = req.body;
    
    // Get lawyer details
    const lawyer = await Lawyer.findOne({ lawyerId });
    if (!lawyer) return res.status(404).json({ 
        error: 'true',
        message:"Lawyer not Found"
     });
    
    const options = {
      amount: lawyer.consultation_fees * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    // Create booking record
    const booking = new Booking({
      userId: req.user.userId,
      lawyerId,
      mode,
      amount: lawyer.consultation_fees,
      paymentId: order.id
    });

    await booking.save();

  return res.status(200).json({
      success: true,
      order,
      booking,
    //   bookingId: booking._id
    });
  } catch (err) {
    res.status(500).json({
         error: true,
         message:"Internal Server error"
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
