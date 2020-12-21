const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const db = require("./config/db");
const path = "/gss/api";
const users = require('./controllers/users')

db.connect((err) => {
    if (err) throw err;
});

app.use(bodyParser.json())

app.use(path + '/users', users);

app.get(path + "/", function (req, res) {
    res.send("Hello!");
});

// // USERS
// app.get(path + "/users/", function (req, res) {
//     db.query(
//         "SELECT * FROM user WHERE archived=0 ORDER BY last_name",
//         (err, rows, fields) => {
//             if (err) throw err;
//             res.status(200).json(rows);
//         }
//     );
// });

// app.post(path + "/users", (req, res) => {
//     const user = req.body;
//     db.query(
//         "INSERT INTO user (dodin, first_name, last_name, association_id, email, phone, unit, archived, updated, updated_user) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), ?)",
//         [
//             user.dodin,
//             user.firstName,
//             user.lastName,
//             user.associationId,
//             user.email,
//             user.phone,
//             user.unit,
//             user.updatedUser,
//         ],
//         (err, rows, fields) => {
//             if (err) throw err;
//             res.status(200).json(rows.insertId);
//         }
//     );
// });

// app.get(path + "/users/:id", (req, res) => {
//     db.query(
//         "SELECT * FROM user WHERE id = ?",
//         [req.params.id],
//         (err, rows, fields) => {
//             if (err) throw err;
//             res.status(200).json(rows);
//         }
//     );
// });

const server = app.listen(0, () =>
    console.log(
        "Application is listening at http://localhost:",
        server.address().port
    )
);
