const express = require("express");
const router = express.Router();

const ResultadoRespuesta = require("../models/resultadoRespuesta");
const AlertaCtrl = require("../controllers/alertaCtrl");

router.post("/aleRegistrarAlerta", async function (req, res) {
    var resultado = new ResultadoRespuesta();
    try {
        resultado = await AlertaCtrl.registrarAlerta(req.body);
    } catch (e) {
        resultado.ok = ResultadoRespuesta.RESPUESTA_FALLO;
        resultado.msg = "Excepcion al registrar alerta: " + e;
    }
    return res.status(200).send(resultado);
});

module.exports = router;