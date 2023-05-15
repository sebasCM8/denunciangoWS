const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const morgan = require('morgan'); //Middleware de registro de solicitudes HTTP para node.js
const bodyparser = require("body-parser");
require('dotenv').config();

const { dbSegipConnection } = require('./src/database/segip_config');
const db = require("./src/database/firestore");

// DB Config MONGODB
dbSegipConnection();

const app = express();
const server = http.createServer(app);


// settings
app.set('port', process.env.PORT || 5000);
var corsOpt = {
    origin: "*"
};
app.use(cors(corsOpt));
app.use(morgan('dev'));

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());



//init all web routes
app.use('/api', require('./src/routes/usuarios'));


//Start Server
server.listen(app.get('port'), () => {
    console.log('Denunciango Web Service on port ', app.get('port'));
});




// app.get("/usuarios", async function (req, res) {
//     try {
//         const snapshot = await db.collection("usuarios").get();
//         //console.log(snapshot);
//         var usuarios = [];
//         snapshot.forEach((doc) => {
//             usuarios.push(doc.data());
//         });
//         //console.log(usuarios);
//         res.status(200).send({ ok: true, msg: "Usuarios obtenidos correctamente", data: usuarios });
//     } catch (e) {
//         console.log("Excepcion: " + e);
//         res.status(200).send({ ok: false, msg: "Error en la solicitud" });
//     }
// });