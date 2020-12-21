const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", function (req, res) {
    db.query(
        "SELECT * FROM user WHERE archived=0 ORDER BY last_name",
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.post("/", (req, res) => {
    const user = req.body;
    db.query(
        "INSERT INTO user (dodin, first_name, last_name, association_id, email, phone, unit, archived, updated, updated_user) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), ?)",
        [
            user.dodin,
            user.firstName,
            user.lastName,
            user.associationId,
            user.email,
            user.phone,
            user.unit,
            user.updatedUser,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows.insertId);
        }
    );
});

router.get("/:id", (req, res) => {
    db.query(
        "SELECT * FROM user WHERE id = ?",
        [req.params.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.post("/:id", (req, res) => {
    const user = req.body;
    db.query(
        "UPDATE user SET dodin = ?, first_name = ?, last_name = ?, association_id = ?, email = ?, phone = ?, unit = ?, archived = ?, updated = NOW(), updated_user = ? WHERE id = ?",
        [
            user.dodin,
            user.firstName,
            user.lastName,
            user.associationId,
            user.email,
            user.phone,
            user.unit,
            user.archived,
            user.updatedUser,
            user.id,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json({
                status: "success",
                message: "User update complete.",
            });
        }
    );
});

router.delete("/:id", (req, res) => {
    db.query(
        "DELETE FROM user WHERE id = ?",
        [req.params.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json({
                status: "success",
                message: "User successfully deleted.",
            });
        }
    );
});

router.get("/search", (req, res) => {
    let str = "%" + decodeURIComponent(req.query.query) + "%";
    db.query(
        "SELECT * FROM user WHERE dodin LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR unit LIKE ?",
        [str, str, str, str, str, str],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

module.exports = router;
