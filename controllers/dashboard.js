const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/services", (req, res) => {
    let sessionData = req.session;
    db.query(
        "SELECT service.*, location.name As location FROM service LEFT JOIN location ON service.location_id = location.id WHERE service.id = (SELECT service_id FROM user_membership WHERE user_id = ?) ORDER BY location.name",
        [sessionData.user.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.get("/service/:id/frontdesk", (req, res) => {
    let sessionData = req.session;
    let id = req.params.id;
    let secure = sessionData.admin.services.includes(parseInt(id));
    if (secure) {
        db.query(
            "SELECT * FROM service_section WHERE service_id = ?",
            [id],
            (err, rows, fields) => {
                if (err) throw err;
                res.status(200).json(rows);
            }
        );
    } else {
        res.status(404);
    }
});

router.get("/section/:id/checkedIn", (req, res) => {
    let id = req.params.id;
    db.query(
        "SELECT reservation.*, reservation_status.status, user.* FROM reservation LEFT JOIN reservation_status ON reservation.status_id = reservation_status.id LEFT JOIN user ON reservation.user_id = user.id WHERE reservation.section_id = ? AND reservation.checked_out IS NULL AND reservation.cancelled = 0 AND reservation.archived = 0",
        [id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

router.get("/section/:id/occupancy/current", (req, res) => {
    let id = req.params.id;
    db.query(
        "SELECT COUNT(*) AS occupancy FROM reservation WHERE checked_in IS NOT NULL AND checked_out IS NULL",
        [id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows[0].currentCount);
        }
    );
});

router.get("/section/:id/occupancy/future", (req, res) => {
    let id = req.params.id;
    let result = { timeSlot: [], occupancy: [] };
    let currDate = new Date();
    db.query(
        "SELECT * FROM service_section_hours WHERE section_id = ? AND day_of_week = ?",
        [id, new Date().getDay()],
        (err, rows, fields) => {
            if (err) throw err;
            console.log(rows)
            if (rows[0].closed === 0) {
                const openHour = parseInt(rows[0].open_time)
                const closeHour = parseInt(rows[0].close_time)
                for (let i = openHour; i < closeHour; i += 0.5) {
                    let date = new Date(
                        currDate.getFullYear(),
                        currDate.getMonth(),
                        currDate.getDate(),
                        i,
                        i % 1 === 0 ? 0 : 30,
                        0
                    );
                    let timeSlot = `${
                        date.getHours() < 10
                            ? "0" + date.getHours()
                            : date.getHours()
                    }:${
                        date.getMinutes() < 10
                            ? "0" + date.getMinutes()
                            : date.getMinutes()
                    }`;
                    db.query(
                        "SELECT ? AS time_slot, COUNT(*) AS occupancy FROM reservation WHERE section_id = ? AND start <= ? AND stop > ? AND cancelled = 0 AND status_id = 1",
                        [timeSlot, id, date, date],
                        (err, rows, fields) => {
                            if (err) throw err;
                            result.timeSlot.push(timeSlot);
                            result.occupancy.push(rows[0].occupancy);
                            if (i === closeHour - 0.5)
                                res.status(200).json(result);
                        }
                    );
                }
            } else {
                res.status(200).json({ status: 200, message: "closed" });
            }
        }
    );
});

module.exports = router;
