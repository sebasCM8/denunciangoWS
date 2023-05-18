const express = require("express");
const http = require("http");
const cors = require("cors");
//const morgan = require('morgan'); //Middleware de registro de solicitudes HTTP para node.js
const bodyparser = require("body-parser");
require("dotenv").config();

const { dbSegipConnection } = require("./src/database/segip_config");

// DB Config MONGODB
dbSegipConnection();

const app = express();
const server = http.createServer(app);

// settings
app.set("port", process.env.PORT || 5000);
var corsOpt = {
  origin: "*",
};
app.use(cors(corsOpt));
//app.use(morgan('dev'));

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

//init all web routes
app.use('/api', require('./src/routes/usuariosroutes'));

//Start Server
server.listen(app.get("port"), () => {
  console.log("Denunciango Web Service on port ", app.get("port"));
});

// const sendEmail = require('./src/helpers/sendGridUtils')
// sendEmail('olmoscamposh@gmail.com')
//   .then(() => {
//     console.log('Correo electrónico enviado exitosamente');
//     // Continúa con el resto de tu lógica aquí
//   })
//   .catch((error) => {
//     console.error('Error al enviar el correo electrónico:', error);
//     // Maneja el error aquí
//   });

// const compareFaces = require("./src/helpers/awsUtils");
// compareFaces(imageData)
//   .then((similitud) => {
//     console.log("Coincidencias de rostros:", similitud);
//     // Continúa con el resto de tu lógica aquí
//   })
//   .catch((error) => {
//     console.error("Error al comparar rostros:", error);
//     // Maneja el error aquí
//   });

// //ESTO ES PA RECUPERAR LA IMAGEN
// const Image = require("./src/models/image");
// const ci = "9020704"; //CI asociado a la imagen que quiero recuperar
// Image.findOne({ ci: ci })
//   .then((imageObject) => {
//     if (imageObject) {
//       const imageData = imageObject.imageData; // Objeto binario de la imagen
//       compareFaces(imageData)
//         .then((similitud) => {
//           console.log("Coincidencias de rostros:", similitud);
//           // Continúa con el resto de tu lógica aquí
//         })
//         .catch((error) => {
//           console.error("Error al comparar rostros:", error);
//           // Maneja el error aquí
//         });
//     } else {
//       console.log("No se encontró la imagen");
//     }
//   })
//   .catch((err) => {
//     console.log("Error al recuperar la imagen:", err);
//   });
// // FIN RECUPERAR LA IMAGEN


