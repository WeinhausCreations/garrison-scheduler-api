const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    const sessionKey = req.body.sessionKey;
    db.query(
        "SELECT user_id, expiration FROM user_session WHERE session_key = ? AND logout = NULL",
        [sessionKey],
        (err, rows, fields) => {
            if (err) throw err;
            if (rows.length > 0) {
                if (rows[0].expiration < new Date()) {
                    db.query(
                        "UPDATE user_session SET session_key = NULL, logout = NOW() WHERE session_key = ?",
                        [sessionKey],
                        (err, rows, fields) => {
                            if (err) throw err;
                            res.status(401).json({
                                status: "failed",
                                message:
                                    "Session is expired. Please login again.",
                            });
                        }
                    );
                } else {
                    res.status(200).json({
                        status: "success",
                        message: "User session verified.",
                        expiration: rows[0].expiration,
                    });
                }
            } else {
                res.status(400).json({
                    status: "failed",
                    message:
                        "User session does not exist. Please log in again.",
                });
            }
        }
    );
});

module.exports = router;
