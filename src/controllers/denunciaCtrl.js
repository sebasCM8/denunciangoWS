const ResponseResult = require("../models/responseresult");
const { db } = require("../database/firestore");
const { dbDos } = require("../database/firestoreDos");
const { collection, query, where, getDocs, doc, getDoc } = require("firebase/firestore");
const TipoDenuncia = require("../models/tipoDenuncia");
const Denuncia = require("../models/denuncia");
const GenericOps = require("../models/genericops");
const encode = require("hashcode").hashCode;


const { storage } = require("../database/cloudStorage");
const { ref, uploadString, getDownloadURL } = require("firebase/storage");

class DenunciaController {

    static async obtenerTipoDenuncia() {
        var response = new ResponseResult();

        var tdRef = db.collection("tipoDenuncia");
        var snapshot = await tdRef.get();
        if (snapshot.empty) {
            response.ok = false;
            response.msg = "No existen tipos denuncia";
            return response;
        }

        var tiposDenuncia = [];
        for (let i = 0; i < snapshot.docs.length; i++) {
            var td = new TipoDenuncia();
            td.tdId = snapshot.docs[i].id;
            td.tdTitulo = snapshot.docs[i].data().tdTitulo;
            tiposDenuncia.push(td);
        }

        response.ok = true;
        response.data = tiposDenuncia;
        response.msg = "Tipos de denuncias obtenidos";
        return response;
    }

    static async registrarDenuncia(denData) {
        var response = new ResponseResult();

        var denObj = new Denuncia();
        denObj.getFromDb(denData);

        var fechaHoy = GenericOps.getDateTime();
        var partesFecha = fechaHoy.split(" ");

        const denunciasRef = collection(dbDos, "denuncias");
        const q = query(denunciasRef, where("denUsu", "==", denObj.denUsu),
            where("denTipo", "==", denObj.denTipo),
            where("denFecha", "==", partesFecha[0]));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.docs.length >= 2) {
            response.ok = false;
            response.msg = "Ya no puede realizar mas denuncias de este tipo por hoy";
            return response;
        }

        var denInfo = denObj.denUsu + denObj.denTitulo + denObj.denDescripcion;
        var hash = encode().value(denInfo);

        const docRef = doc(dbDos, "denuncias", hash.toString());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            response.ok = false;
            response.msg = "Denuncia duplicada, la denuncia ya ha sido registrada";
            return response;
        }

        denObj.denFecha = partesFecha[0];
        denObj.denHora = partesFecha[1];
        denObj.denEstado = 1;
        //await setDoc(doc(db, "denuncias", hash.toString()), denObj.toDbmap());

        for (let i = 0; i < denData.images.length; i++) {
            var imgName = hash.toString() + i.toString();

        }

        await db.collection("denuncias").doc(hash.toString()).set(denObj.toDbmap());

        response.ok = true;
        response.msg = "Denuncia registrada correctamente";

        return response;
    }

}

module.exports = DenunciaController;