const express = require("express");
const router = express.Router();
const { verifyToken, restrictTo } = require('../middleware/auth');

const {
    GetAllLawyersList,
    UpdateAnyLawyerData,
    DeleteAnyLawyer,
    ActiveAnyLawyer
}=require('../Controllers/auth.controller');


router.get('/lwayerlist',GetAllLawyersList);
router.put('/updatelawyer/:lawyerId',UpdateAnyLawyerData);
router.put('/dellawyer/:lawyerId',  DeleteAnyLawyer);   //admin only
router.put('/activelawyer/:lawyerId',  ActiveAnyLawyer);   //admin only





module.exports = router;