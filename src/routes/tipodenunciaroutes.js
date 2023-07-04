const express = require("express");
const ResponseResult = require("../models/responseresult");
const router = express.Router();
const TipoDenunciaController = require("../controllers/tipodenunciaCtrl");

router.get("/tdObtenerTiposDen", async function (req, res) {
    var response = new ResponseResult();

    try {
        response = await TipoDenunciaController.obtenerTipoDen();
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion: " + e;
    }

    return res.status(200).send(response.getResponseData());
});

router.post("/tdRegistrarTipoDen", async function (req, res) {
    var response = new ResponseResult();

    try {
        response = await TipoDenunciaController.registrarTipoDen(req.body);
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion: " + e;
    }

    return res.status(200).send(response.getResponseData());
});

module.exports = router;