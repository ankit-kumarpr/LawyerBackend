const mongoose=require('mongoose');

const AdminSchema=new mongoose.Schema({
    adminId:{
        type:String
    },
    name:{
        type:String,
        required:true,

    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    phone:{
        type:String,
        
    }
})

module.exports=mongoose.model("Admin",AdminSchema);