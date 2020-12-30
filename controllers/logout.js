const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    const sessionKey = req.session.key;
    db.query(
        "UPDATE user_session SET session_key = NULL, logout = NOW() WHERE session_key = ?",
        [sessionKey],
        (err, rows, fields) => {
            if (err) throw err;
            res.clearCookie("userSession");
            res.status(200).json({
                status: 200,
                message: "User session ended.",
            });
            req.session.destroy();
        }
    );
});

module.exports = router;