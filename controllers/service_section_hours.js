const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:section", (req, res) => {
    db.query(
        "SELECT * FROM service_section_hours WHERE section_id = ? AND archived=0",
        [req.params.section],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.post("/:section", (req, res) => {
    const section = req.body;
    db.query(
        "INSERT INTO service_section_hours (section_id, day_of_week, open_time, close_time, closed, archived, updated, updated_user) VALUES (?, ?, ?, ?, ?, 0, NOW(), ?",
        [
            section.sectionId,
            section.dayOfWeek,
            section.openTime,
            section.closeTime,
            section.closed,
            section.updatedUserId,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows.insertId);
        }
    );
});

router.patch("/:section/:id", (req, res) => {
    const section = req.body;
    db.query(
        "UPDATE service_section_hours SET section_id = ?, day_of_week = ?, open_time = ?, close_time = ?, closed = ?, archived = ?, updated = NOW(), updated_user = ? WHERE id = ?",
        [
            section.sectionId,
            section.dayOfWeek,
            section.openTime,
            section.closeTime,
            section.closed,
            section.archived,
            section.updatedUserId,
            section.id,
        ],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json({
                status: "success",
                message: "Hours update complete.",
            });
        }
    );
});
