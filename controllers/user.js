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
            user.updatedUserId,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows.insertId);
        }
    );
});

router.get("/user/:id", (req, res) => {
    db.query(
        "SELECT * FROM user WHERE id = ?",
        [req.params.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.post("/user/:id", (req, res) => {
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
            user.updatedUserId,
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

router.delete("/user/:id", (req, res) => {
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
    if (req.query) {
        !req.query.firstName ? req.query.firstName = "%" : req.query.firstName = "%" + req.query.firstName + "%";
        !req.query.lastName ? req.query.lastName = "%" : req.query.lastName = "%" + req.query.lastName + "%";
        !req.query.dodin ? req.query.dodin = "%" : req.query.dodin = "%" + req.query.dodin + "%";
        !req.query.phone ? req.query.phone = "%" : req.query.phone = "%" + req.query.phone + "%";
        !req.query.email ? req.query.email = "%" : req.query.email = "%" + req.query.email + "%";
        console.log(req.query);
        db.query(
            "SELECT * FROM user WHERE first_name LIKE ? AND last_name LIKE ? AND dodin LIKE ? AND phone LIKE ? AND email LIKE ?",
            [
                req.query.firstName,
                req.query.lastName,
                req.query.dodin,
                req.query.phone,
                req.query.email,
            ],
            (err, rows, fields) => {
                if (err) throw err;
                res.status(200).json(rows);
            }
        );
    } else {
        res.status(400).json({
            status: "bad request",
            message: "input search parameters",
        });
    }
});

router.get("/check", (req, res) => {
    db.query(
        "SELECT COUNT(*) AS emailCount FROM user WHERE email = ?", [req.query.email], (err, rows, fields) => {
            if (err) throw err
            res.status(200).json(rows[0].emailCount);
        }
    )
})

module.exports = router;
