const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/", (req, res) => {
    const sessionKey = req.body.sessionKey;
    db.query(
        "UPDATE user_session SET session_key = NULL, logout = NOW() WHERE session_key = ?",
        [sessionKey],
        (err, rows, fields) => {
            if (err) throw err;
            res.clearCookie("userSession");
            res.status(200).json({
                status: "success",
                message: "User session ended.",
            });
        }
    );
});

module.exports = router;