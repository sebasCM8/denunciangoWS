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









const fs = require("fs");
const AWS = require('aws-sdk');
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION, // por ejemplo, 'us-east-1'
});

AWS.config.getCredentials(function(err) {
  if(err) console.log(err.stack, "error mierda");
  else{
    console.log("access key: ", AWS.config);
  }
})



const rekognition = new AWS.Rekognition();

// Leer la imagen de origen desde el archivo local
const sourceImageData = fs.readFileSync('yo3.jpeg');
const sourceImageBase64 = sourceImageData.toString('base64');

// Leer la imagen objetivo desde el archivo local
const targetImageData = fs.readFileSync('yo4.jpeg');
const targetImageBase64 = targetImageData.toString('base64');

const params = {
  SourceImage: {
    Bytes: Buffer.from(sourceImageBase64, 'base64'),
  },
  TargetImage: {
    Bytes: Buffer.from(targetImageBase64, 'base64'),
  },
};

rekognition.compareFaces(params, (err, data) => {
  if (err) {
    console.log(err, err.stack);
  } else {
    console.log(data.FaceMatches);
  }
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