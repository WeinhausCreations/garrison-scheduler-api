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
    session({
        secret: "SemperSupra!",
        resave: true,
        saveUninitialized: true,
        cookie: {
            // secure: true,
            httpOnly: true,
            // sameSite: 'none',
        },
    })
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
                reservations = rows;
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

    socket.on("reservations changed", (data, cb) => {
        console.log("data:" + data)
        db.query(
            "SELECT reservation.*, user.first_name, user.last_name, reservation_status.status FROM reservation LEFT JOIN user ON reservation.user_id = user.id LEFT JOIN reservation_status ON reservation.status_id = reservation_status.id WHERE reservation.archived = 0 AND reservation.checked_out IS NULL AND reservation.cancelled = 0",
            (err, rows, fields) => {
                if (err) throw err;
                reservations = rows;
                io.emit("reservations update", reservations);
                cb({
                    status: "success",
                });
            }
        );
    });
});

server.listen(port, () => console.log(`App listening on port ${port}`));
