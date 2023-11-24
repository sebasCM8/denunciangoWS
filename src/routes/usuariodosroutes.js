const express = require("express");
const router = express.Router();

const ResultadoRespuesta = require("../models/resultadoRespuesta");
const UsuarioDosCtrl = require("../controllers/usuarioDosCtrl");

router.post("/udRegistrarUsuario", async function (req, res) {
    var resultado = new ResultadoRespuesta();
    try {
        resultado = await UsuarioDosCtrl.registrarUsuario(req.body);
    } catch (e) {
        resultado.ok = ResultadoRespuesta.RESPUESTA_FALLO;
        resultado.msg = "Excepcion al registrar usuario: " + e;
    }
    return res.status(200).send(resultado);
});

router.post("/udLoginUsuario", async function (req, res) {
    var resultado = new ResultadoRespuesta();
    try {
        resultado = await UsuarioDosCtrl.loginUsuario(req.body);
    } catch (e) {
        resultado.ok = ResultadoRespuesta.RESPUESTA_FALLO;
        resultado.msg = "Excepcion al realizar login: " + e;
    }
    return res.status(200).send(resultado);
});

router.post("/udActualizarTokenCelular", async function (req, res) {
    var resultado = new ResultadoRespuesta();
    try {
        resultado = await UsuarioDosCtrl.actualizarTokenCelular(req.body);
    } catch (e) {
        resultado.ok = ResultadoRespuesta.RESPUESTA_FALLO;
        resultado.msg = "Excepcion al actualizar token celular: " + e;
    }
    return res.status(200).send(resultado);
});

module.exports = router;