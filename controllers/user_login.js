const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

router.post("/register", (req, res) => {
    const login = req.body;
    bcrypt.hash(login.password, 10, (b_err, hash) => {
        if (b_err) throw err;
        login.password = hash;
        db.query(
            "INSERT INTO user_login (user_id, username, password, updated, archived, updated_user) VALUES (?, ?, ?, NOW(), 0, ?)",
            [
                login.userId,
                login.username,
                login.password,
                login.creatinguserId,
            ],
            (err, rows, fields) => {
                if (err) throw err;
                res.status(200).json(rows.insertId);
            }
        );
    });
});

router.post("/update", (req, res) => {
    const login = req.body;
    db.query(
        "UPDATE user_login SET username = ?, archived = ?, updated = NOW(), updated_user = ? WHERE user_id = ?",
        [login.username, login.archived, login.updatedUser, login.userid],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json({
                status: "success",
                message: "Login update complete.",
            });
        }
    );
});

router.post("/update/password", (req, res) => {
    const login = req.body;
    bcrypt.hash(login.oldPassword, 10, (b_err, hash) => {
        if (b_err) throw err;
        login.oldPassword = hash;
        db.query(
            "SELECT password FROM user_login WHERE user_id = ?",
            [login.userId],
            (err, rows, fields) => {
                if (err) throw err;
                bcrypt.compare(
                    login.oldPassword,
                    rows[0].password,
                    (b_err, b_res) => {
                        if (b_err) throw b_err;
                        if (b_res) {
                            bcrypt.hash(
                                login.newPassword,
                                10,
                                (b_err, hash) => {
                                    if (b_err) throw b_err;
                                    login.newPassword = hash;
                                    db.query(
                                        "UPDATE user_login SET password = ? WHERE user_id = ?",
                                        [login.newPassword, login.userId],
                                        (err, rows, fields) => {
                                            if (err) throw err;
                                            res.status(200).json({
                                                status: "success",
                                                message:
                                                    "Password update complete.",
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    }
                );
            }
        );
    });
});

module.exports = router;
