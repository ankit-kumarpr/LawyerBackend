const express = require("express");
const router = express.Router();
const { verifyToken, restrictTo } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { createOrder,
    verifyPayment} = require('../Controllers/paymentController');
const {
  sendMessage,
  getChatList,
  getChatHistory,
  markAsRead,
} = require("../Controllers/messageController");
const {completeBooking,
    getLawyerBookings,
    getUserBookings,
    respondToBooking,
    getBooking} = require('../Controllers/bookingController');
const {getUserTransactions,
      getLawyerBookingHistory,
} = require('../Controllers/transactionController');
const {
  GetAllLawyersList,
  UpdateAnyLawyerData,
  DeleteAnyLawyer,
  ActiveAnyLawyer,
  GetAllUserList,
  UpdateuserData,
} = require("../Controllers/auth.controller");

router.get("/lwayerlist", GetAllLawyersList);
router.post("/updatelawyer/:lawyerId", UpdateAnyLawyerData);
router.post("/dellawyer/:lawyerId", DeleteAnyLawyer); //admin only
router.put("/activelawyer/:lawyerId", ActiveAnyLawyer); //admin only

// users
router.get("/alluser", GetAllUserList); //admin only
router.post("/updateuser/:userId", UpdateuserData);

// order api
router.post('/createorder',verifyToken,createOrder);
router.post("/paymentverify", verifyToken, verifyPayment);

// chat router
router.post("/sendmessage", verifyToken, upload.array("files", 10), sendMessage);
router.get("/gethistory/:bookingId", verifyToken, getChatHistory);
router.get("/chatlist/chats", verifyToken, getChatList);
router.put("read/:bookingId/read", verifyToken, markAsRead);

router.get('/lawyerbooking',verifyToken, getLawyerBookings );
router.put("/bookings/:id", verifyToken, respondToBooking);


// transection routes
router.get("/lawyertransectionhistoty/:lawyerId", getLawyerBookingHistory);
router.get("/userhistory/:userId", getUserTransactions);
module.exports = router;
