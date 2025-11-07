const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2. Send the email
    return transporter.sendMail({
        from: '"FetchQuest" <fetchquest.app@example.com>', // sender address
        to, // list of receivers
        subject, // Subject line
        html, // html body
    });
};

module.exports = sendEmail;