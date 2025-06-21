const mongoose = require("mongoose");

const LawyerSchema = new mongoose.Schema({
    lawyerId:{
        type:String,
    },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
    minlegth:10,
    maxlength:10
  },
  addressline:{
    type:String,
  },
  city:{
    type:String,
    required:true
  },
  password: {
    type: String,
    required: true,
    minlegth: 8,
  },
 licenseNumber: {
  type: String,
  required: true,
},
  specialization: {
    type: String,
  },
  isverified:{
    type:Boolean,
    default:false,
  },
  created_at:{
    type:Date,
    default:Date.now()
  },
  is_deleted:{
    type:Boolean,
    default:false
  }
});

module.exports = mongoose.model("Lawyer", LawyerSchema);
