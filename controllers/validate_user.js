const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

router.post("/", (req, res) => {
    const login = req.body;
    db.query(
        "SELECT * FROM user_login WHERE username = ?",
        [login.username],
        (err, rows, fields) => {
            if (err) throw err;
            bcrypt.compare(login.password, rows[0].password, (b_err, b_res) => {
                if (b_res) {
                    if (login.remember === true) {
                        res.cookie("userId", rows[0].user_id, {
                            expires: new Date(
                                2 * 24 * 60 * 60 * 60 + Date.now()
                            ),
                            httpOnly: true,
                            secure: true,
                        });
                    } else {
                        res.clearCookie("userId")
                    }
                    res.status(200).json({
                        status: "success",
                        message: "user login verified",
                        userId: rows[0].user_id,
                    });
                } else {
                    res.status(404).json({
                        status: "failed",
                        message: "user login verification failed.",
                    });
                }
            });
        }
    );
});