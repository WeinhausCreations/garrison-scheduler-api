const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const uid = require("uid-safe");

router.post("/register", (req, res) => {
    const login = req.body;
    bcrypt.hash(login.password, 10, (b_err, hash) => {
        if (b_err) throw err;
        login.password = hash;
        db.query(
            "INSERT INTO user_login (user_id, username, password, updated, archived, updated_user) VALUES (?, ?, ?, NOW(), 0, ?)",
            [login.userId, login.username, login.password, login.updatedUserId],
            (err, rows, fields) => {
                if (err) throw err;
                res.status(200).json(rows.insertId);
            }
        );
    });
});

router.patch("/update", (req, res) => {
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

router.patch("/update/password", (req, res) => {
    const login = req.body;
    db.query(
        "SELECT password FROM user_login WHERE user_id = ?",
        [login.userId],
        (err, rows, fields) => {
            if (err) throw err;
            if (bcrypt.compareSync(login.oldPassword, rows[0].password)) {
                const newPassword = bcrypt.hashSync(login.newPassword, 10);
                db.query(
                    "UPDATE user_login SET password = ? WHERE user_id = ?",
                    [newPassword, login.userId],
                    (err, rows, fields) => {
                        if (err) throw err;
                        res.status(200).json({
                            status: "success",
                            message: "Password updated.",
                        });
                    }
                );
            } else {
                res.status(404).json({
                    status: "failed",
                    message: "Password mismatch.",
                });
            }
        }
    );
});

router.post("/", (req, res) => {
    const login = req.body;
    db.query(
        "SELECT * FROM user_login WHERE username = ?",
        [login.username],
        (err, rows, fields) => {
            if (err) throw err;
            if (bcrypt.compareSync(login.password, rows[0].password)) {
                const sessionKey = uid.sync(18);
                const userId = rows[0].user_id;

                db.query(
                    "SELECT COUNT(*) AS membershipCount FROM user_membership WHERE user_id = ?",
                    [userId],
                    (err, rows, fields) => {
                        if (err) throw err;
                        let admin = false;
                        rows[0].membershipCount > 0
                            ? (admin = true)
                            : (admin = false);
                        db.query(
                            "INSERT INTO user_session (user_id, session_key, login, expiration) VALUES (?, ?, NOW(), NOW() + INTERVAL 2 DAY)",
                            [userId, sessionKey],
                            (err, rows, fields) => {
                                if (err) throw err;
                                let sessionData = req.session;
                                sessionData.user = {};
                                sessionData.user.id = userId;
                                sessionData.user.admin = admin;
                                sessionData.user.key = sessionKey;
                                sessionData.user.username = login.username;

                                if (login.remember === true) {
                                    sessionData.cookie = {
                                        expires: new Date(
                                            2 * 24 * 60 * 60 * 60 + Date.now()
                                        ),
                                        // secure: true
                                    };
                                }
                                res.status(200).json({
                                    status: 200,
                                    message:
                                        "user login verified, session created",
                                    userId: userId,
                                    admin: admin,
                                });
                            }
                        );
                    }
                );
            } else {
                res.status(401).json({
                    status: "failed",
                    message: "user login verification failed.",
                });
            }
        }
    );
});

router.get("/check", (req, res) => {
    if (req.query.username) {
        db.query(
            "SELECT COUNT(*) AS usernameCount FROM user_login WHERE username = ?",
            [req.query.username],
            (err, rows, fields) => {
                if (err) throw err;
                res.status(200).json(rows[0].usernameCount);
            }
        );
    }
});

module.exports = router;
