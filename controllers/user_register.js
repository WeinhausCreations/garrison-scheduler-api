const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const uid = require("uid-safe");
const transporter = require("../config/emailTransporter");

router.post("/self", (req, res) => {
    const user = req.body;
    db.query(
        "INSERT INTO user (dodin, first_name, last_name, association_id, email, phone, unit, archived, updated, updated_user) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), 0)",
        [
            user.dodin,
            user.firstName,
            user.lastName,
            user.associationId,
            user.email,
            user.phone,
            user.unit,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            const userId = rows.insertId;
            let hash = bcrypt.hashSync(user.password, 10);
            user.password = hash;
            db.query(
                "INSERT INTO user_login (user_id, username, password, updated, archived, updated_user) VALUES (?, ?, ?, NOW(), 0, 0)",
                [userId, user.username, user.password],
                (err, rows, fields) => {
                    if (err) {
                        db.query("DELETE FROM user WHERE id = ?", [userId]);
                        throw err;
                    }
                    const loginId = rows.insertId;
                    const code = uid.sync(6);
                    db.query(
                        "INSERT INTO user_verification (user_id, CAC_verified, acct_verified, verification_code, code_expiration, archived, updated, updated_user) VALUES (?, 0, 0, ?, NOW() + INTERVAL 1 DAY, 0, NOW(), 0)",
                        [userId, code],
                        (err, rows, fields) => {
                            if (err) {
                                db.query(
                                    "DELETE FROM user_login WHERE id = ?",
                                    [loginId]
                                );
                                db.query("DELETE FROM user WHERE id = ?", [
                                    userId,
                                ]);
                                throw err;
                            }
                            const verId = rows.insertId;
                            var mailOptions = {
                                from: "no-reply@weinhauscreations.com",
                                to: user.email,
                                subject:
                                    "Welcome to Garrison Scheduler - Please Verify Your Email",
                                html: `<h2>Thank You for Registering</h2>
                                        <p>Your account has been created in the Garrison Scheduler System. The next step is to verify your email. Please click the link below to verify your email and activate your account.</p>
                                        <p><a href="https://garrisonscheduler.com/verify?code=${code}">Verify Your Email</a></p>
                                        <p>After you verify your account you'll have access to the scheduling system. Please ensure that you bring your ID to your first visit so that it can be verified by staff.</p>
                                        <p>Very respectfully,</p>
                                        <p>Garrison Scheduler Team</p>`,
                            };

                            transporter.sendMail(mailOptions, (err, info) => {
                                if (err) {
                                    db.query(
                                        "DELETE FROM user_verification WHERE id = ?",
                                        [verId]
                                    );
                                    db.query(
                                        "DELETE FROM user_login WHERE id = ?",
                                        [loginId]
                                    );
                                    db.query("DELETE FROM user WHERE id = ?", [
                                        userId,
                                    ]);
                                    throw err;
                                }
                                res.status(200).json({
                                    status: 200,
                                    message:
                                        "Account created. Please verify your email.",
                                });
                            });
                        }
                    );
                }
            );
        }
    );
});

module.exports = router;
