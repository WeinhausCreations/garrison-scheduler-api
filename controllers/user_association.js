const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    db.query(
        "SELECT * FROM user_association WHERE archived=0 ORDER BY orientation",
        (err, rows, fields) => {
            if (err) throw err;
            res.status(200).json(rows);
        }
    );
});

module.exports = router;