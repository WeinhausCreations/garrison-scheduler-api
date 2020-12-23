const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    db.query(
        "SELECT * FROM service WHERE archived = 0",
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.get("/service/:id", (req, res) => {
    db.query(
        "SELECT * FROM service WHERE id = ?",
        [req.params.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.post("/", (req, res) => {
    const service = req.body;
    db.query(
        "INSERT INTO sevice (name, max_guests, self_check_in, self_check_out, archived, updated, updated_user) VALUES (?, ?, ?, ?, 0, NOW(), ?)",
        [
            service.name,
            service.maxGuests,
            service.selfCheckIn,
            service.selfCheckOut,
            service.updatedUserId,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json({
                status: "success",
                message: "Service added successfully",
                serviceId: rows.insertId,
            });
        }
    );
});

router.patch("/service/:id", (req, res) => {
    const service = req.body;
    db.query(
        "UPDATE service SET name = ?, max_guests = ?, self_check_in = ?, self_check_out = ?, archived = ?, updated = NOW(), updated_user = ? WHERE id = ?",
        [
            service.name,
            service.maxGuests,
            service.selfCheckIn,
            service.selfCheckOut,
            service.archived,
            service.updatedUserId,
            service.id,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json({
                status: "success",
                message: "Service updated successfully",
            });
        }
    );
});
