const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    let sessionData = req.session;
    if (sessionData.user && sessionData.user.key) {
        res.status(200).json({
            status: 200,
            message: "User session verified",
            userId: sessionData.user.id,
            admin: sessionData.user.admin,
            username: sessionData.user.username,
        });
    } else {
        res.status(400).json({
            status: 400,
            message: "User session does not exist. Please log in again.",
        });
    }
});

module.exports = router;
