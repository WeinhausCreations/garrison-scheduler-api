const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");
const uid = require("uid-safe");

router.post("/", (req, res) => {
    const login = req.body;
    db.query(
        "SELECT * FROM user_login WHERE username = ?",
        [login.username],
        (err, rows, fields) => {
            if (err) throw err;
            if (bcrypt.compareSync(login.password, rows[0].password)) {
                const sessionKey = uid.sync(18);
                if (login.remember === true) {
                    res.cookie("userSession", sessionKey, {
                        expires: new Date(2 * 24 * 60 * 60 * 60 + Date.now()),
                        httpOnly: true,
                        secure: true,
                    });
                }
                db.query(
                    "INSERT INTO user_session (user_id, session_key, login, expiration) VALUES (?, ?, NOW(), NOW() + INTERVAL 2 DAY)",
                    [rows[0].user_id, sessionKey],
                    (err, rows, fields) => {
                        if (err) throw err;
                        res.status(200).json({
                            status: "success",
                            message: "user login verified, session created",
                            userSession: sessionKey,
                        });
                    }
                );
            } else {
                res.status(404).json({
                    status: "failed",
                    message: "user login verification failed.",
                });
            }
        }
    );
});

module.exports = router;
