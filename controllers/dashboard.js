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
            console.log(rows);
            res.status(200).json(rows);
        }
    );
});

module.exports = router;
