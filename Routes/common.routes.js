const express = require("express");
const router = express.Router();
const { verifyToken, restrictTo } = require("../middleware/auth");

const {
  GetAllLawyersList,
  UpdateAnyLawyerData,
  DeleteAnyLawyer,
  ActiveAnyLawyer,
  GetAllUserList,
  UpdateuserData,
} = require("../Controllers/auth.controller");

router.get("/lwayerlist", GetAllLawyersList);
router.put("/updatelawyer/:lawyerId", UpdateAnyLawyerData);
router.put("/dellawyer/:lawyerId", DeleteAnyLawyer); //admin only
router.put("/activelawyer/:lawyerId", ActiveAnyLawyer); //admin only

// users
router.get("/alluser", GetAllUserList); //admin only
router.put("/updateuser/:userId", UpdateuserData);

module.exports = router;
