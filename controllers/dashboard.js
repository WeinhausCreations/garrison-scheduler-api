const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    let sessionData = req.session
    db.query(
        "SELECT service.*, location.name As location FROM service LEFT JOIN location ON service.location_id = location.id WHERE service.id = (SELECT service_id FROM user_membership WHERE user_id = ?) ORDER BY location.name", [sessionData.user.id],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

module.exports = router;