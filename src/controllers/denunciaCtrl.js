const ResponseResult = require("../models/responseresult");
const { db } = require("../database/firestore");
const { dbDos } = require("../database/firestoreDos");
const { collection, query, where, getDocs, doc, getDoc } = require("firebase/firestore");
const TipoDenuncia = require("../models/tipoDenuncia");
const Denuncia = require("../models/denuncia");
const GenericOps = require("../helpers/genericops");
const encode = require("hashcode").hashCode;

const tieneContenidoOfensivo = require("../helpers/openaiUtils");
const { detectarEtiquetas } = require("../helpers/awsUtils");


const { storage } = require("../database/cloudStorage");
const { ref, uploadString, getDownloadURL } = require("firebase/storage");
const estados = require("./estadosCtrl");
const { ResourceExplorer2 } = require("aws-sdk");

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

    static async obtenerEstadosDenuncia() {
        var response = new ResponseResult();

        response.ok = true;
        response.msg = "Estados de denuncia obtenidos correctamente";
        response.data = estados;

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

        //CHATGPT DESCRIPTION VALIDATION
        var esOfensivo = await tieneContenidoOfensivo(denObj.denDescripcion);
        if (esOfensivo) {
            response.ok = false;
            response.msg = "La descripcion tiene contenido ofensivo";
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
        denObj.denEstado = 1; // 1 ES ESTADO PENDIENTE

        //AWS IMAGE VALIDATION
        for (let i2 = 0; i2 < denData.images.length; i2++) {
            var b64Img = denData.images[i2];
            let allEtiquetas;
            await detectarEtiquetas(b64Img)
                .then((etiquetas) => {
                    allEtiquetas = etiquetas;
                })
                .catch(() => {
                    response.ok = false;
                    response.msg = "Error al obtener etiquetas";
                    return response;
                });

            let categoria = this.clasificarImagen(allEtiquetas);
            if (categoria != denObj.denTipo) {
                response.ok = false;
                response.msg = "Su imagen no corresponde con el tipo de denuncia";
                return response;
            }
        }

        var denImagenes = "";
        for (let i = 0; i < denData.images.length; i++) {
            var imgName = hash.toString() + i.toString() + ".txt";
            const storageRef = ref(storage, imgName);
            await uploadString(storageRef, denData.images[i]);
            denImagenes += imgName + ", ";
        }
        denObj.denImagenes = denImagenes;

        await db.collection("denuncias").doc(hash.toString()).set(denObj.toDbmap());

        response.ok = true;
        response.msg = "Denuncia registrada correctamente";

        return response;
    }

    static async obtenerDenunciasUsu(usuEmail) {
        var response = new ResponseResult();
        const denRef = db.collection("denuncias").where("denUsu", "==", usuEmail);
        const snap = await denRef.get();

        const tdRef = db.collection("tipoDenuncia");
        const tdSnap = await tdRef.get();

        var denuncias = [];
        for (let i = 0; i < snap.docs.length; i++) {
            var den = new Denuncia();
            den.getFromDbAll(snap.docs[i].data());
            den.denFecha = snap.docs[i].data().denFecha;
            den.denHora = snap.docs[i].data().denHora;
            den.denId = snap.docs[i].id;

            for (let itd = 0; itd < tdSnap.docs.length; itd++) {
                if (den.denTipo == tdSnap.docs[itd].id) {
                    den.denTdTitulo = tdSnap.docs[itd].data().tdTitulo;
                }
            }

            for (let iest = 0; iest < estados.length; iest++) {
                if (estados[iest].estId == den.denEstado) {
                    den.denEstTitulo = estados[iest].estTitulo;
                }
            }

            denuncias.push(den);
        }

        for (let i1 = 0; i1 < (denuncias.length - 1); i1++) {
            for (let i2 = (i1 + 1); i2 < denuncias.length; i2++) {
                var d1Str = denuncias[i1].denFecha + " " + denuncias[i1].denHora;
                var d1 = GenericOps.initializeDate(d1Str);
                var d2Str = denuncias[i2].denFecha + " " + denuncias[i2].denHora;
                var d2 = GenericOps.initializeDate(d2Str);
                if (d2 > d1) {
                    var xden = denuncias[i1];
                    denuncias[i1] = denuncias[i2];
                    denuncias[i2] = xden;
                }
            }
        }

        response.ok = true;
        response.msg = "Denuncias obtenidas correctamente";
        response.data = denuncias;
        return response;
    }

    static async obtenerDetalleDenuncia(denId) {
        var response = new ResponseResult();

        const denRef = db.collection("denuncias").doc(denId);
        const doc = await denRef.get();
        if (!doc.exists) {
            response.ok = false;
            response.msg = "No existe denuncia";
            return response;
        }

        console.log("got denuncia");
        var denunciaObj = new Denuncia();
        denunciaObj.getFromDbAll(doc.data());
        console.log("denuncia initialized");
        denunciaObj.denId = doc.id;

        response.ok = true;
        response.msg = "Denuncia obtenida correctamente";
        response.data = denunciaObj;

        return response;
    }

    static clasificarImagen(etiquetas) {
        let cBasura = 0;
        let cAreaVerde = 0;
        let cAlumbrado = 0;
        let cCalle = 0;
        etiquetas.forEach((unaEtiqueta) => {

            if (unaEtiqueta.Name === "Garbage" && unaEtiqueta.Confidence >= 87) cBasura++;
            if (unaEtiqueta.Name === "Trash" && unaEtiqueta.Confidence >= 87) cBasura++;

            if (unaEtiqueta.Name === "Grass" && unaEtiqueta.Confidence >= 87) cAreaVerde++;
            if (unaEtiqueta.Name === "Park" && unaEtiqueta.Confidence >= 87) cAreaVerde++;
            if (unaEtiqueta.Name === "Tree" && unaEtiqueta.Confidence >= 87) cAreaVerde++;
            if (unaEtiqueta.Name === "Nature" && unaEtiqueta.Confidence >= 87) cAreaVerde++;
            if (unaEtiqueta.Name === "Plant" && unaEtiqueta.Confidence >= 87) cAreaVerde++;
            if (unaEtiqueta.Name === "Vegetation" && unaEtiqueta.Confidence >= 87) cAreaVerde++;

            if (unaEtiqueta.Name === "Utility Pole" && unaEtiqueta.Confidence >= 87) cAlumbrado++;
            if (unaEtiqueta.Name === "Lamp Post" && unaEtiqueta.Confidence >= 87) cAlumbrado++;
            if (unaEtiqueta.Name === "Lighting" && unaEtiqueta.Confidence >= 87) cAlumbrado++;
            if (unaEtiqueta.Name === "Flare" && unaEtiqueta.Confidence >= 87) cAlumbrado++;

            if (unaEtiqueta.Name === "Road" && unaEtiqueta.Confidence >= 87) cCalle++;
            if (unaEtiqueta.Name === "Street" && unaEtiqueta.Confidence >= 87) cCalle++;
            if (unaEtiqueta.Name === "Hole" && unaEtiqueta.Confidence >= 87) cCalle++;
            if (unaEtiqueta.Name === "Tar" && unaEtiqueta.Confidence >= 87) cCalle++;
        });

        if (cBasura === 2) {
            //Servicio de Basura
            return 3;
        }
        if (cAreaVerde >= 3) {
            //Area verde
            return 1;
        }
        if (cAlumbrado >= 2) {
            //Alumbrado
            return 4;
        }
        if (cCalle >= 2) {
            //Via publica
            return 2;
        }

        return 0;
    }

}

module.exports = DenunciaController;