const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    db.query("SELECT * FROM location ORDER BY name", (err, rows, fields) => {
        if (err) throw err;
        res.status(200).json(rows);
    });
});

router.post("/", (req, res) => {
    db.query(
        "INSERT INTO location (name) VALUES (?)",
        [req.body.name],
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows.insertId);
        }
    );
});

module.exports = router;
