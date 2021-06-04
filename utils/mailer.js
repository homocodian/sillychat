require("dotenv").config({path:"../.env"});
const nodemailer = require('nodemailer');

function Email(req,res,sub,textBody,) {
    const transpoter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:587,
        secure:false,
        requireTLS:false,
        disableFileAccess:true,
        disableUrlAccess:true,
        auth:{
            user:process.env.USER,
            pass:process.env.PASSTOKEN
        }
    });
    
    const mailOptions = {
        form : process.env.USER,
        to: "ashishcbscboard@gmail.com",
        subject:sub,
        text: textBody
    }
    
    transpoter.sendMail(mailOptions,(err,info)=>{
        if (err) {
            req.flash("emailError","Email not sent");
            res.redirect('/');
        }
        else{
            res.render('submittion-success');
        }
    })
}

module.exports = Email;