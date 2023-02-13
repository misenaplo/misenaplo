const nodemailer = require("nodemailer");

if (process.env.SMTP_FROM === undefined) {
    console.log("Missing SMTP_FROM envvar! Are your environment variables up-to-date?")
} 

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: Boolean(process.env.SMTP_SECURE) || false,
    auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: !(Boolean(process.env.SMTP_TLS_SELFSIGNED) || false)
    }
})

transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("SMTP connection established");
    }
});

module.exports = transporter