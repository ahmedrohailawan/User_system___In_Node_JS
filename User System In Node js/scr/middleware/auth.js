const jwt = require("jsonwebtoken");
const Register = require("../models/signup");

const auth = async (req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        const verifyuser = jwt.verify(token,process.env.SECRET_KEY);
        const user = await Register.findOne({_id:verifyuser._id})
        req.token = token;
        req.user = user;
        next();
    }catch(error){
        res.render("login_signup",{message:"you have to login first!"})
    }
}
module.exports = auth;

