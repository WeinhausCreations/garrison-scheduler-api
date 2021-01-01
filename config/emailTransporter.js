const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: "mail.weinhauscreations.com",
    port: 465,
    secure: true,
    auth: {
        user: "no-reply@weinhauscreations.com",
        pass: "noReply123!@#",
    },
});

module.exports = transporter;
