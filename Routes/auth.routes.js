const express = require("express");
const router = express.Router();
const {
  Register,
  login,
  verifyLawyer,
} = require("../Controllers/auth.controller");

router.post("/register", Register);
router.post("/login", login);
router.put("/verify-lawyer/:lawyerId", verifyLawyer);

module.exports = router;
