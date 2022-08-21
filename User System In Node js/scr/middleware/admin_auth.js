const jwt = require("jsonwebtoken");
const Register = require("../models/signup");

const admin_auth = async (req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        const verifyuser = jwt.verify(token,process.env.SECRET_KEY);
        const user = await Register.findOne({_id:verifyuser._id})
        if(user.is_admin ==1){
            req.token = token;
            req.user = user;
            next();
        }else{
            res.send("Only admins can access this page")
        }
    }catch(error){
        res.send("This is admin page you can't access this page")
    }
}
module.exports = admin_auth;