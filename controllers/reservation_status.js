const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    db.query(
        "SELECT * FROM reservation_status WHERE archived = 0",
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

module.exports = router;