const express = require("express");
const ResponseResult = require("../models/responseresult");
const router = express.Router();
const AreaController = require("../controllers/areaCtrl");

router.get("/areObtenerAreas", async function (req, res) {
    var response = new ResponseResult();

    try {
        response = await AreaController.obtenerAreas();
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion: " + e;
    }

    return res.status(200).send(response.getResponseData());
});

router.post("/areRegistrarArea", async function (req, res) {
    var response = new ResponseResult();

    try {
        response = await AreaController.registrarArea(req.body);
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion: " + e;
    }

    return res.status(200).send(response.getResponseData());
});

module.exports = router;