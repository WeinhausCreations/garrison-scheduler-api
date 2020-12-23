const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/service/:id", (req, res) => {
    db.query(
        "SELECT * FROM user_membership WHERE service_id = ?",
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.get("/user/:id", (req, res) => {
    db.query(
        "SELECT * FROM user_membership WHERE user_id = ?",
        [req.params.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.post("/", (req, res) => {
    const membership = req.body;
    db.query(
        "INSERT INTO user_membership (user_id, service_id, level, archived, updated, updated_user) VALUES (?, ?, ?, 0, NOW(), ?)",
        [
            membership.userId,
            membership.serviceId,
            membership.level,
            membership.updatedUserId,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows.insertId);
        }
    );
});

router.patch("/section/:id", (req, res) => {
    const membership = req.body;
    db.query(
        "UPDATE service_section SET user_id = ?, service_id = ?, level = ?, archived = ?, updated = NOW(), updated_user = ? WHERE id = ?",
        [
            membership.userId,
            membership.serviceId,
            membership.level,
            membership.archived,
            membership.updatedUserId,
            membership.id,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json({
                status: "success",
                message: "Membership update complete.",
            });
        }
    );
});
