const ResponseResult = require("../models/responseresult");
const TipoDenuncia = require("../models/tipoDenuncia");
const { db } = require("../database/firestore");

class TipoDenunciaController {
    static async registrarTipoDen(data) {
        var result = new ResponseResult();

        var td = new TipoDenuncia();
        td.fromWebReg(data);
        td.tdEstado = 1;
        await db.collection("tipoDenuncia").add(td.toFirestore());

        result.ok = true;
        result.msg = "Tipo de denuncia registrado";

        return result;
    }

    static async obtenerTipoDen() {
        var result = new ResponseResult();

        var snap = await db.collection("tipoDenuncia").where("tdEstado", "==", 1).get();
        var tdsss = [];
        for (let i = 0; i < snap.docs.length; i++) {
            var td = new TipoDenuncia();
            td.fromFirestore(snap.docs[i].data());
            td.tdId = snap.docs[i].id;

            tdsss.push(td);
        }

        result.ok = true;
        result.msg = "Tipos de denuncia obtenidas";
        result.data = tdsss;
        return result;
    }
}

module.exports = TipoDenunciaController;