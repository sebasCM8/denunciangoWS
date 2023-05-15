const express = require("express");
const ResponseResult = require("./models/responseresult");
const UsuarioCtrl = require("./controllers/usuarioCtrl");
const router = express.Router();
<<<<<<< HEAD:src/routes/usuarios.js
const db = require("../database/firestore");

router.get("/usuarios", async function(req, res){
=======

router.get("/usuariosr", async function (req, res) {
>>>>>>> 2df43fb61a9204419467b00dba74d70b584081d0:routes.js
    try {
        const snapshot = await db.collection("usuarios").get();
        //console.log(snapshot);
        var usuarios = [];
        snapshot.forEach((doc) => {
            usuarios.push(doc.data());
        });
        //console.log(usuarios);
        res.status(200).send({ ok: true, msg: "Usuarios obtenidos correctamente", data: usuarios });
    } catch (e) {
        console.log("Excepcion: " + e);
        res.status(200).send({ ok: false, msg: "Error en la solicitud" });
    }
});

router.post("/login", async function (req, res) {
    var response = new ResponseResult();
    try {
        response = await UsuarioCtrl.login(req.body.email, req.body.pass);
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion al iniciar sesion: " + e;
    }
    console.log(response);
    return res.status(200).send(response.getResponseData());
});

module.exports = router; 