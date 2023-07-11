const express = require("express");
const ResponseResult = require("../models/responseresult");
const UsuarioCtrl = require("../controllers/usuarioCtrl");
const router = express.Router();

router.post("/login", async function (req, res) {
  var response = new ResponseResult();
  try {
    response = await UsuarioCtrl.login(req.body.email, req.body.pass);
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion al iniciar sesion: " + e;
  }
  return res.status(200).send(response.getResponseData());
});

// //rgistrar paso1: ci
// router.get("/registrarPasoUno", async function (req, res) {
//   var response = new ResponseResult();
//   try {
//     response = await UsuarioCtrl.registroVerificarCarnet('9020704');
//     // response = await UsuarioCtrl.registroVerificarCarnet(req.body.ci);
//   } catch (e) {
//     response.ok = false;
//     response.msg = "Excepcion al iniciar sesion: " + e;
//   }
//   return res.status(200).send(response.getResponseData());
// });

//registrar paso2: ci, imageusu
router.post("/registrarPasoDos", async function (req, res) {
  var response = new ResponseResult();
  try {
    response = await UsuarioCtrl.registroVerificarFotoCI(req.body.ci,req.body.imageusu);
    // const fs = require("fs");
    // const img = fs.readFileSync("i1.png").toString("base64");
    // response = await UsuarioCtrl.registroVerificarFotoCI("1234567", img);
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion al relizar registro: " + e;
  }
  return res.status(200).send(response.getResponseData());
});

//registrar paso3: email
router.post("/registrarPasoTres", async function (req, res) {
  var response = new ResponseResult();
  try {
    response = await UsuarioCtrl.registroVerificarCorreo(req.body.email);
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion al realzar registro: " + e;
  }
  return res.status(200).send(response.getResponseData());
});

//registrar final: todo
router.get("/registrarPasoFinal", async function (req, res) {
  var response = new ResponseResult();
  try {
    response = await UsuarioCtrl.registroFinalizado(response);
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion al realizar registro: " + e;
  }
  return res.status(200).send(response.getResponseData());
});

module.exports = router;
