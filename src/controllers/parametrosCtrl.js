const { db } = require("../database/firestore");
const Parametro = require("../models/parametros");

class ParametrosController {
    static cLOGININTENTOS = "loginintentos";
    static cLOGINTIEMPOBLOQUEO = "logintiempobloqueo";
    static cTIEMPOPASSWORD = "tiempopassword";
    static cPASSLENGTH = "passlength";

    static async getLOGININTENTOS() {
        var paramsRef = db.collection("parametros").doc(this.cLOGININTENTOS);
        var doc = await paramsRef.get();
        var data = doc.data()
        var parametro = new Parametro(doc.id, data["parValor"]);
        return parametro;
    }

    static async getLOGINTIEMPOBLOQUEO() {
        var paramsRef = db.collection("parametros").doc(this.cLOGINTIEMPOBLOQUEO);
        var doc = await paramsRef.get();
        var data = doc.data()
        var parametro = new Parametro(doc.id, data["parValor"]);
        return parametro;
    }

    static async getTIEMPOPASSWORD() {
        var paramsRef = db.collection("parametros").doc(this.cTIEMPOPASSWORD);
        var doc = await paramsRef.get();
        var data = doc.data()
        var parametro = new Parametro(doc.id, data["parValor"]);
        return parametro;
    }

    static async getPASSLENGTH() {
        var paramsRef = db.collection("parametros").doc(this.cPASSLENGTH);
        var doc = await paramsRef.get();
        var data = doc.data()
        var parametro = new Parametro(doc.id, data["parValor"]);
        return parametro;
    }
}

module.exports = ParametrosController;