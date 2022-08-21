require('dotenv').config()
require("./db/conn");
const express = require('express');
const app = express();
const bcrypt = require("bcryptjs")
const path = require("path");
const Register = require("./models/signup");
const hbs = require('hbs');
const e = require('express');
const jwt = require("jsonwebtoken");
const multer = require("multer")
const auth = require("./middleware/auth")
const admin_auth = require("./middleware/admin_auth")
const cookie = require("cookie-parser");
const { homedir } = require('os');



const port = process.env.PORT || 3000;

const static_path = path.join(__dirname,"../public");
const views_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");
app.use(express.static(static_path));
app.set("views",views_path);
hbs.registerPartials(partials_path);
app.set("view engine", "hbs");
app.use(express.json());
app.use(cookie())
app.use(express.urlencoded({extended:false}));
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,"../public/user_images"))
    },filename: function(req,file,cb){
        const name = Date.now() + path.extname(file.originalname)
        cb(null,name)
    }
});
const upload = multer({storage:storage})



app.get("/",auth,async(req,res)=>{
    const user = await Register.findOne({_id:req.user._id})
    res.render("home",{user:user})
});

app.get("/admin",admin_auth,async(req,res)=>{
    const users = await Register.find({is_admin:0})
    console.log(users)
    res.render("admin_panel",{users:users})
});

app.get("/login",auth,async(req,res)=>{
    res.redirect("/")
});


app.get("/logout",auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((currentelement)=>{
            return currentelement.token != req.token
        });
        res.clearCookie("jwt");
        req.user.is_login = false
        await req.user.save();
        res.render("login_signup",{message:"logout successfully!"});
    }catch(error){
        res.status(500).send(error)
    }
});
app.get("/edit",auth,async(req,res)=>{
    
    try{
        const user = await Register.findOne({_id:req.user._id})
        if(user){
            res.render("edit",{user:user});
        }else{
            res.redirect('/');
        }

    }catch(error){
        console.log(error);
    }

});


app.post("/register",upload.single('image'), async (req,res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        const email = req.body.email
        const useremail = await Register.findOne({email:email})
        if(password == cpassword ){
            if(useremail ==null ){
            const registeruser = new Register({
                name : req.body.name,
                email : req.body.email,
                image : req.file.filename,
                password: req.body.password,
                confirmpassword : req.body.confirmpassword,
                is_admin : 0
            });
            const token =  await registeruser.generateauthtoken();
            res.cookie("jwt",token,{
                // expires:new Date(Date.now() + 30000),
                // secure:true,
                httpOnly:true
            });
            const registered = await registeruser.save();
            res.redirect("/")
        }else{
            res.render("login_signup",{message:"Email already exist!"});
        }}
        else{
            res.render("login_signup",{message:"Password do not match!"});
        }
    }catch(error){
        res.status(400).render("login_signup",{message:"An error occured!"});
        console.log(error)
    }
});

app.post("/login",async (req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const useremail = await Register.findOne({email:email});
        const ismatch = await bcrypt.compare(password,useremail.password);
        const token =  await useremail.generateauthtoken();
        useremail.is_login = true
        useremail.save()
        res.cookie("jwt",token,{
            // expires:new Date(Date.now() + 30000),
            // secure:true,
            httpOnly:true
        });
        if (ismatch ){
            res.redirect("/")
        }else{
            res.render("login_signup",{message:"Invalid credentials!"})
        }
    } catch(error){
        res.render("login_signup",{message:"Invalid credentials!!"})
    }
});


app.post("/edit",upload.single('image'),async (req,res)=>{
    try{
        if (req.file){
            const user = await Register.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,gender:req.body.gender,age:req.body.age,country:req.body.country,course:req.body.course,duration:req.body.duration,image:req.file.filename}});
        }else{
            const user = await Register.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,gender:req.body.gender,age:req.body.age,country:req.body.country,course:req.body.course,duration:req.body.duration}});
        }
        res.redirect("/")
    } catch(error){
        res.send(error)
        console.log(error)
    }
});


app.listen(port,()=>{
    console.log(`server is running at port no ${port}`);
});