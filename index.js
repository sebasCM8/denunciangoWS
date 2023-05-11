const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const bodyparser = require("body-parser");

const db = require("./firestoreHelper");

const app = express();
const server = http.createServer(app);

var corsOpt = {
    origin: "*"
};
app.use(cors(corsOpt));

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.get("/usuarios", async function (req, res) {
    try {
        const snapshot = await db.collection("usuarios").get();
        //console.log(snapshot);
        var usuarios = [];
        snapshot.forEach((doc) => {
            usuarios.push(doc.data());
        });
        //console.log(usuarios);
        res.status(200).send({ ok: true, msg: "Usuarios obtenidos correctamente", data: usuarios });
    } catch (e) {
        console.log("Excepcion: " + e);
        res.status(200).send({ ok: false, msg: "Error en la solicitud" });
    }
});

const router = require("./routes");
app.use(router);

const port = 3004;
server.listen(port, () => {
    console.log("Denunciango Web Service on port " + port);
});