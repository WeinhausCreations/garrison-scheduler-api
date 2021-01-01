const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const db = require("./config/db");
const path = "/v1";
const users = require("./controllers/user");
const login = require("./controllers/user_login");
const validate = require("./controllers/validate_user");
const logout = require("./controllers/logout");
const register = require("./controllers/user_register");
const email = require("./controllers/email");
const verify = require("./controllers/verify_user");
const association = require("./controllers/user_association");
const resStatus = require("./controllers/reservation_status");
const dashboard = require("./controllers/dashboard")
const cors = require("cors");
const session = require("express-session");

db.connect((err) => {
    if (err) throw err;
});

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

app.use(path + "/users", users);
app.use(path + "/login", login);
app.use(path + "/validate", validate);
app.use(path + "/logout", logout);
app.use(path + "/register", register);
app.use(path + "/res_status", resStatus);
app.use(path + "/email", email);
app.use(path + "/verify", verify);
app.use(path + "/association", association);
app.use(path + "/dashboard", dashboard)

app.get(path + "/", function (req, res) {
    res.send("Hello!");
});

app.get(path + "/search", (req, res) => {
    res.send("test");
});

app.get(path + "/checksession", (req, res) => {
    let sessionData = req.session;
    res.send(sessionData.user.id + "/" + sessionData.user.admin);
});

const server = app.listen(0, () =>
    console.log(
        "Application is listening at http://localhost:",
        server.address().port
    )
);
