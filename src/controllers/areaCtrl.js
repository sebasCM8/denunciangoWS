const ResponseResult = require("../models/responseresult");
const Area = require("../models/area");
const AreTd = require("../models/aretd");
const { db } = require("../database/firestore");

class AreaController {
    static async registrarArea(data) {
        var result = new ResponseResult();

        var are = new Area();
        are.getFromWebReg(data.area);
        are.areEstado = 1;

        var resp = await db.collection("areas").add(are.toFirestore());
        for (let i = 0; i < data.tipos.length; i++) {
            var at = new AreTd();
            at.atAre = resp.id;
            at.atTd = data.tipos[i].atTd;
            at.atEstado = 1;
            await db.collection("aretd").add(at.toFirestore());
        }

        result.ok = true;
        result.msg = "Nueva area registrada";

        return result;
    }

    static async obtenerAreas() {
        var result = new ResponseResult();

        var areas = await db.collection("areas").where("areEstado", "==", 1).get();
        var data = [];
        for (let i = 0; i < areas.docs.length; i++) {
            var are = new Area();
            are.getFromFirestore(areas.docs[i].data());
            are.areId = areas.docs[i].id;
            data.push(are);
        }

        result.ok = true;
        result.msg = "Areas obtenidas";
        result.data = data;

        return result;
    }
}

module.exports = AreaController;