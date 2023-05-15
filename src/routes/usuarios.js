const express = require("express");
const router = express.Router();
const db = require("../database/firestore");

router.get("/usuarios", async function(req, res){
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

module.exports = router; 