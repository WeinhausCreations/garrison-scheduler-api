const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");
const { json } = require("body-parser");

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

// router.post("/password/overwrite", (req, res) => {
//     const login = req.body;
//     const newPassword = bcrypt.hashSync(login.newPassword, 10);
//     db.query("UPDATE user_login SET password = ? WHERE user_id = ?", [newPassword, login.userId], (err, rows, fields) => {
//         if(err) throw err;
//         res.status(200).json(rows);
//     })
// })

router.post("/update/password", (req, res) => {
    const login = req.body;
    db.query(
        "SELECT password FROM user_login WHERE user_id = ?",
        [login.userId],
        (err, rows, fields) => {
            if (err) throw err;
            if(bcrypt.compareSync(login.oldPassword, rows[0].password)){
                const newPassword = bcrypt.hashSync(login.newPassword, 10);
                db.query("UPDATE user_login SET password = ? WHERE user_id = ?", [newPassword, login.userId], (err, rows, fields) => {
                    if (err) throw err;
                    res.status(200).json({
                        status: "success",
                        message: "Password updated."
                    });
                })
            } else {
                res.status(404).json({
                    status: "failed",
                    message: "Password mismatch.",
                });
            }
        }
    );
});

module.exports = router;
