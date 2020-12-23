const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const db = require("./config/db");
const path = "/gss/api";
const users = require("./controllers/user");
const login = require("./controllers/user_login");
const validate = require("./controllers/validate_user");
const logout = require("./controllers/logout");

db.connect((err) => {
    if (err) throw err;
});

app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());

app.use(path + "/users", users);
app.use(path + "/login", login);
app.use(path + "/validate", validate);
app.use(path + "/logout", logout);

app.get(path + "/", function (req, res) {
    res.send("Hello!");
});

app.get(path + "/search", (req, res) => {
    res.send("test");
});

const server = app.listen(3500, () =>
    console.log(
        "Application is listening at http://localhost:",
        server.address().port
    )
);
