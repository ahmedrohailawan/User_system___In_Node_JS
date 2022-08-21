const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Registerschema = new mongoose.Schema({
    name :{
        type:String,
        required:true
    },
    email :{
        type:String,
        required:true,
        unique:true
    },
    gender :{
        type:String,
        default : "Male"
    },
    age:{
        type:String,
        default : "16"
    },
    country:{
        type:String,
        default:"pakistan"
    },
    company:{
        type:String,
        default : "EZI Technologies"
    },
    course :{
        type:String,
        default : "Web Developement"
    },
    duration :{
        type:String,
        default : "3 months"
    },
    image :{
        type:String,
        required:true
    },
    password :{
        type:String,
        required:true
    },
    confirmpassword :{
        type:String,
        required:true
    },
    is_admin :{
        type:Number,
        required:true,
    },
    is_login :{
        type:Boolean,
        default:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});

Registerschema.methods.generateauthtoken = async function(){
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token
}


Registerschema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        this.confirmpassword = await bcrypt.hash(this.password,10);
    }
    next()
});
const Register = new mongoose.model("Register",Registerschema);
module.exports = Register;