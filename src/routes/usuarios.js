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

//rgistrar paso1: ci
router.post("/registrarPasoUno", async function (req, res) {
    var response = new ResponseResult();
    try {
        response = await UsuarioCtrl.registroVerificarCarnet(req.body.ci);
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion al iniciar sesion: " + e;
    }
    return res.status(200).send(response.getResponseData());
});


//registrar paso2: ci, imageusu
router.post("/registrarPasoDos", async function (req, res) {
    var response = new ResponseResult();
    try {
        response = await UsuarioCtrl.registroVerificarFoto(req.body.ci, req.body.imageusu);
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion al iniciar sesion: " + e;
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
        response.msg = "Excepcion al iniciar sesion: " + e;
    }
    return res.status(200).send(response.getResponseData());
});

//registrar final: todo
router.post("/registrarPasoFinal", async function (req, res) {
    var response = new ResponseResult();
    try {
        response = await UsuarioCtrl.registroFinalizado(req.body);
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion al iniciar sesion: " + e;
    }
    return res.status(200).send(response.getResponseData());
});

module.exports = router;