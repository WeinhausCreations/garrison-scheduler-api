const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    let sessionData = req.session;
    db.query(
        "UPDATE user_session SET session_key = NULL, logout = NOW() WHERE session_key = ?",
        [sessionData.key],
        (err, rows, fields) => {
            if (err) throw err;
            req.session.destroy();
            res.status(200).json({
                status: 200,
                message: "User session ended.",
            });
        }
    );
});

module.exports = router;