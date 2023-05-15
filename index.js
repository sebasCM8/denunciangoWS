const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const bodyparser = require("body-parser");

const app = express();
const server = http.createServer(app);

var corsOpt = {
    origin: "*"
};
app.use(cors(corsOpt));

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const router = require("./routes");
app.use(router);

const port = 3004;
server.listen(port, () => {
    console.log("Denunciango Web Service on port " + port);
});