const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const socketIo = require("socket.io");
const http = require("http");

const db = require("./config/db");
const index = require("./controllers/index");
const users = require("./controllers/user");
const login = require("./controllers/user_login");
const validate = require("./controllers/validate_user");
const logout = require("./controllers/logout");
const register = require("./controllers/user_register");
const email = require("./controllers/email");
const verify = require("./controllers/verify_user");
const association = require("./controllers/user_association");
const resStatus = require("./controllers/reservation_status");
const dashboard = require("./controllers/dashboard");

const port = 3500;
const path = "/v1";

db.connect((err) => {
    if (err) throw err;
});

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());
app.use(
    session({ secret: "SemperSupra!", resave: true, saveUninitialized: true })
);

// var whitelist = ["https://*.garrisonscheduler.com", "http://localhost:3000"];
// var corsOptions = {
//     origin: function (origin, callback) {
//         if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error("Not allowed by CORS"));
//         }
//     },
// };
// app.use(cors(corsOptions));
app.use(cors());

//controllers
app.use(path, index);
app.use(path + "/users", users);
app.use(path + "/login", login);
app.use(path + "/validate", validate);
app.use(path + "/logout", logout);
app.use(path + "/register", register);
app.use(path + "/res_status", resStatus);
app.use(path + "/email", email);
app.use(path + "/verify", verify);
app.use(path + "/association", association);
app.use(path + "/dashboard", dashboard);

//socket.io setup
const server = http.createServer(app);
const io = socketIo(server);

//global variables
let userCount = 0;
let reservations = [];
let initConnect = true;

//socket.io implementation
io.on("connection", (socket) => {
    userCount++;
    console.log("Users connected: " + userCount);
    io.emit("Users Connected", userCount);

    if (initConnect) {
        db.query(
            "SELECT reservation.*, user.first_name, user.last_name, reservation_status.status FROM reservation LEFT JOIN user ON reservation.user_id = user.id LEFT JOIN reservation_status ON reservation.status_id = reservation_status.id WHERE reservation.archived = 0 AND reservation.checked_out IS NULL AND reservation.cancelled = 0",
            (err, rows, fields) => {
                if (err) throw err;
                for (let i = 0; i < rows.length; i++)
                    reservations.push(rows[i]);
                io.emit("reservations update", reservations);
            }
        );
        initConnect = false;
    } else {
        socket.emit("reservations update", reservations);
    }

    socket.on("disconnect", () => {
        userCount--;
        console.log("Users connected: " + userCount);
        io.emit("Users Connected", userCount);
    });

    socket.on("reservation create", (data, cb) => {
        db.query(
            "INSERT INTO reservation (user_id, service_id, section_id, status_id, is_group, group_name, start, stop, checked_in, checked_out, created, cancelled, archived, updated, updated_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), ?)",
            [
                data.userId,
                data.serviceId,
                data.sectionId,
                data.statusId,
                data.isGroup,
                data.groupName,
                data.start,
                data.stop,
                data.checkedIn,
                data.checkedOut,
                data.created,
                data.cancelled,
                data.updatedUserId,
            ],
            (err, rows, fields) => {
                if (err) throw err;
                const insertId = rows.insertId;
                db.query(
                    "SELECT reservation.*, user.first_name, user.last_name, reservation_status.status FROM reservation LEFT JOIN user ON reservation.user_id = user.id LEFT JOIN reservation_status ON reservation.status_id = reservation_status.id WHERE id = ?",
                    [insertId],
                    (err, rows, fields) => {
                        if (err) throw err;
                        reservations.push(rows[0]);
                        io.emit("reservations update", reservations);
                        cb({
                            status: "complete",
                        });
                    }
                );
            }
        );
    });

    socket.on("reservation patch", (data, cb) => {
        db.query(
            "UPDATE reservation SET user_id = ?, service_id = ?, section_id = ?, status_id = ?, is_group = ?, group_name = ?, start = ?, stop = ?, checked_in = ?, checked_out = ?, created = ?, cancelled = ?, archived = ?, updated = NOW(), updated_user = ? WHERE id = ?",
            [
                data.userId,
                data.serviceId,
                data.sectionId,
                data.statusId,
                data.isGroup,
                data.groupName,
                data.start,
                data.stop,
                data.checkedIn,
                data.checkedOut,
                data.created,
                data.cancelled,
                data.archived,
                data.updatedUserId,
                data.id,
            ],
            (err, rows, fields) => {
                if (err) throw err;
                db.query(
                    "SELECT reservation.*, user.first_name, user.last_name, reservation_status.status FROM reservation LEFT JOIN user ON reservation.user_id = user.id LEFT JOIN reservation_status ON reservation.status_id = reservation_status.id WHERE id = ?",
                    [data.id],
                    (err, rows, fields) => {
                        if (err) throw err;
                        const index = reservations.findIndex(
                            (element) => element.id === data.id
                        );
                        if (index > -1) reservations.splice(index, 1);
                        reservations.push(rows[0]);
                        io.emit("reservations update", reservations);
                        cb({
                            status: "complete",
                        });
                    }
                );
            }
        );
    });
});

server.listen(port, () => console.log(`App listening on port ${port}`));
