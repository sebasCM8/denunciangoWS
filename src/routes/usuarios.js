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
//registrar paso2: ci, imageusu
//registrar paso3: email
//registrar final: todo

module.exports = router;