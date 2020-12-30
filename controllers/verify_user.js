const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    const code = req.query.code;
    db.query(
        "SELECT * FROM user_verification WHERE verification_code = ?",
        [code],
        (err, rows, fields) => {
            if (err) throw err;
            if (rows.length > 0) {
                const expiration = new Date(rows[0].code_expiration);
                if (new Date() < expiration) {
                    const userId = rows[0].user_id;
                    db.query(
                        "UPDATE user_verification SET acct_verified = 1, verification_code = NULL, code_expiration = NULL, updated = NOW(), updated_user = ? WHERE user_id = ?",
                        [userId, userId],
                        (err, rows, fields) => {
                            if (err) throw err;
                            res.status(200).json({
                                status: 200,
                                response: "Verified",
                                message: "Verification Successful.",
                            });
                        }
                    );
                } else {
                    res.status(200).json({
                        status: 200,
                        response: "Expired",
                        message: "Verification code has expired.",
                    });
                }
            } else {
                res.status(400).json({
                    status: 400,
                    response: "Bad Code",
                    message: "Code not found in database",
                });
            }
        }
    );
});

module.exports = router;
