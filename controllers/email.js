const express = require("express");
const router = express.Router();
const transporter = require("../config/emailTransporter");

router.post("/", (req, res) => {
    const body = req.body;
    let mailOptions = {
        from: body.from,
        to: body.to,
        subject: body.subject,
        text: body.text,
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) throw err;
        res.status(200).json(info);
    });
});

module.exports = router;
