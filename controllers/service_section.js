const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    db.query(
        "SELECT * FROM service_section WHERE archived=0",
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.get("/section/:id", (req, res) => {
    db.query(
        "SELECT * FROM service_section WHERE id = ?",
        [req.params.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.post("/", (req, res) => {
    const section = req.body;
    db.query(
        "INSERT INTO service_section (service_id, name, max_guests, guests_from_service, groups_only, block_only, duration_min, interval_min, archived, updated, updated_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), ?)",
        [
            section.serviceId,
            section.name,
            section.maxGuests,
            section.guestsFromService,
            section.groupsOnly,
            section.blockOnly,
            section.durationMin,
            section.intervalMin,
            section.updatedUserId,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows.insertId);
        }
    );
});

router.patch("/section/:id", (req, res) => {
    const section = req.body;
    db.query(
        "UPDATE service_section SET service_id = ?, name = ?, max_guests = ?, guests_from_service = ?, groups_only = ?, block_only = ?, duration_min = ?, interval_min = ?, archived = ?, updated = NOW(), updated_user = ? WHERE id = ?",
        [
            section.serviceId,
            section.name,
            section.maxGuests,
            section.guestsFromService,
            section.groupsOnly,
            section.blockOnly,
            section.durationMin,
            section.intervalMin,
            section.archived,
            section.updatedUserId,
            section.id,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json({
                status: "success",
                message: "Section update complete.",
            });
        }
    );
});
