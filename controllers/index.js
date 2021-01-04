const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
    res.send("Hello!");
});

router.get("/search", (req, res) => {
    res.send("test");
});

router.get("/checksession", (req, res) => {
    let sessionData = req.session;
    res.send(sessionData.user.id + "/" + sessionData.user.admin);
});

module.exports = router;