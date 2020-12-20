const express = requires("express");
const app = express();
const port = 3001;

app.get("/", (req, res) => res.send("Hello World"));

app.listen(port, () =>
    console.log(`Garrison Scheduler API listening at https://localhost:${port}`)
);
