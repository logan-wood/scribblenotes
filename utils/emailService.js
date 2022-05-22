const nodemailer = require('nodemailer');
require('dotenv').config()

const sendEmail = async (email, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: text
    }

    await transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error)
        }
    });    
}

module.exports = sendEmail;