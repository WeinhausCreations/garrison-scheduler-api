const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    db.query(
        "SELECT * FROM reservation WHERE archived = 0",
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.get("/reservation/:id", (req, res) => {
    db.query(
        "SELECT * FROM reservation WHERE id = ?",
        [req.params.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.get("/user/:id", (req, res) => {
    db.query(
        "SELECT * FROM reservation WHERE user_id = ?",
        [req.params.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});


router.get("/service/:id", (req, res) => {
    db.query(
        "SELECT * FROM reservation WHERE service_id = ?",
        [req.params.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.get("/section/:id", (req, res) => {
    db.query(
        "SELECT * FROM reservation WHERE section_id = ?",
        [req.params.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.get("/status/:id", (req, res) => {
    db.query(
        "SELECT * FROM reservation WHERE status_id = ?",
        [req.params.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.post("/", (req, res) => {
    const reservation = req.body;
    db.query(
        "INSERT INTO reservation (user_id, service_id, section_id, status_id, is_group, group_name, start, stop, checked_in, checked_out, created, cancelled, archived, updated, updated_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), ?)",
        [
            reservation.userId,
            reservation.serviceId,
            reservation.sectionId,
            reservation.statusId,
            reservation.isGroup,
            reservation.groupName,
            reservation.start,
            reservation.stop,
            reservation.checkedIn,
            reservation.checkedOut,
            reservation.created,
            reservation.cancelled,
            reservation.updatedUserId,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows.insertId);
        }
    );
});

router.patch("/service/:id", (req, res) => {
    const reservation = req.body;
    db.query(
        "UPDATE reservation SET user_id = ?, service_id = ?, section_id = ?, status_id = ?, is_group = ?, group_name = ?, start = ?, stop = ?, checked_in = ?, checked_out = ?, created = ?, cancelled = ?, archived = ?, updated = NOW(), updated_user = ? WHERE id = ?",
        [
            reservation.userId,
            reservation.serviceId,
            reservation.sectionId,
            reservation.statusId,
            reservation.isGroup,
            reservation.groupName,
            reservation.start,
            reservation.stop,
            reservation.checkedIn,
            reservation.checkedOut,
            reservation.created,
            reservation.cancelled,
            reservation.archived,
            reservation.updatedUserId,
            reservation.id,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json({
                status: "success",
                message: "Reservation updated successfully",
            });
        }
    );
});
