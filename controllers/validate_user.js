const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    if (req.session.user && req.session.key) {
        res.status(200).json({
            message: "User verified",
        });
    } else if (req.cookies.userSession) {
        res.status(400).json({
            status: 400,
            message: "User session does not exist. Please log in again.",
        });
    } else {
        const sessionKey = req.cookies.userSession;
        db.query(
            "SELECT user_id, expiration FROM user_session WHERE session_key = ? AND logout IS NULL",
            [sessionKey],
            (err, rows, fields) => {
                if (err) throw err;
                if (rows.length > 0) {
                    const userId = rows[0].user_id;
                    if (rows[0].expiration < new Date()) {
                        db.query(
                            "UPDATE user_session SET session_key = NULL, logout = NOW() WHERE session_key = ?",
                            [sessionKey],
                            (err, rows, fields) => {
                                if (err) throw err;
                                res.status(401).json({
                                    status: 401,
                                    message:
                                        "Session is expired. Please login again.",
                                });
                            }
                        );
                    } else {
                        db.query(
                            "SELECT COUNT(*) AS membershipCount FROM user_membership WHERE user_id = ?",
                            [userId],
                            (err, rows, fields) => {
                                if (err) throw err;
                                let admin = false;
                                rows[0].membershipCount > 0
                                    ? (admin = true)
                                    : (admin = false);
                                req.session.user = userId;
                                req.session.admin = admin;
                                req.session.key = sessionKey;
                                res.status(200).json({
                                    status: 200,
                                    message: "User session verified.",
                                    userId: userId,
                                    admin: admin,
                                });
                            }
                        );
                    }
                } else {
                    res.status(400).json({
                        status: 400,
                        message:
                            "User session does not exist. Please log in again.",
                    });
                }
            }
        );
    }
});

module.exports = router;
