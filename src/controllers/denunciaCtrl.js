const ResponseResult = require("../models/responseresult");
const { db, messaging } = require("../database/firestore");
const { dbDos } = require("../database/firestoreDos");
const { collection, query, where, getDocs, doc, getDoc } = require("firebase/firestore");
const TipoDenuncia = require("../models/tipoDenuncia");
const Denuncia = require("../models/denuncia");
const GenericOps = require("../helpers/genericops");
const DenReview = require("../models/denReview");
const encode = require("hashcode").hashCode;

const tieneContenidoOfensivo = require("../helpers/openaiUtils");
const { detectarEtiquetas } = require("../helpers/awsUtils");


const { storage } = require("../database/cloudStorage");
const { ref, uploadString, getDownloadURL } = require("firebase/storage");
const estados = require("./estadosCtrl");

const axios = require("axios");
const Usuario = require("../models/usuario");
const Image = require("../models/image");

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
            await this.registrarDenRechazada(denObj, denData.images);

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
        var tiposControlados = ["0Il2q9T9VRcKFfcHBSRs", "8K4c5TpJQ7TUDwgsj2Go",
            "GKrND2lyGc3ytXKp9MIa", "NHxtpwBbEApglNuVbxv0"];
        if (tiposControlados.includes(denObj.denTipo)) {
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
                    await this.registrarDenRechazada(denObj, denData.images);

                    response.ok = false;
                    response.msg = "Su imagen no corresponde con el tipo de denuncia";
                    return response;
                }
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

    static async registrarDenRechazada(denData, denImagenes) {
        const ESTRECHAZADO = 0; //0 es rechazado
        const denRef = db.collection("denuncias");
        var denInfo = denData.denUsu + denData.denTitulo + denData.denDescripcion;
        var hash = encode().value(denInfo);
        var aurita = GenericOps.getDateTime();
        var fechaParts = aurita.split(" ");
        denData.denFecha = fechaParts[0];
        denData.denHora = fechaParts[1];
        var denImages = "";
        for (let i = 0; i < denImagenes.length; i++) {
            var imgName = hash.toString() + i.toString() + ".txt";
            const storageRef = ref(storage, imgName);
            await uploadString(storageRef, denImagenes[i]);
            denImages += imgName + ", ";
        }
        denData.denImagenes = denImages;
        denData.denEstado = ESTRECHAZADO;
        await denRef.doc(hash.toString()).set(denData.toDbmap());
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

        //GETTING TIPOS DENUNCIA
        if (tdSnap.empty) {
            response.ok = false;
            response.msg = "No existen tipos denuncia";
            return response;
        }

        var tiposDenuncia = [];
        for (let i = 0; i < tdSnap.docs.length; i++) {
            var td = new TipoDenuncia();
            td.tdId = tdSnap.docs[i].id;
            td.tdTitulo = tdSnap.docs[i].data().tdTitulo;
            tiposDenuncia.push(td);
        }

        var respData = {
            tds: tiposDenuncia,
            ests: estados,
            denuncias: denuncias
        };

        response.ok = true;
        response.msg = "Denuncias obtenidas correctamente";
        response.data = respData;
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

        var denunciaObj = new Denuncia();
        denunciaObj.getFromDbAll(doc.data());
        denunciaObj.denId = doc.id;

        var imgNames = denunciaObj.denImagenes.split(",");
        var denImagenes = [];
        for (let i = 0; i < imgNames.length; i++) {
            if (imgNames[i] != " ") {
                var imgName = imgNames[i].trim();
                const storageRef = ref(storage, imgName);
                var url = await getDownloadURL(storageRef);
                await axios
                    .get(url)
                    .then((response) => {
                        denImagenes.push(response.data);
                    })
                    .catch((error) => {
                        console.error(error);
                        response.ok = false;
                        response.msg = "Excepcion en img cloud storage: " + error;
                        return response;
                    });
            }
        }

        response.ok = true;
        response.msg = "Denuncia obtenida correctamente";
        response.data = {
            den: denunciaObj,
            denImagenes: denImagenes
        };

        return response;
    }

    static clasificarImagen(etiquetas) {
        let cBasura = 0;
        let cAreaVerde = 0;
        let cAlumbrado = 0;
        let cCalle = 0;

        var idViaPublica = "0Il2q9T9VRcKFfcHBSRs";
        var idAlumbradoPublico = "8K4c5TpJQ7TUDwgsj2Go";
        var idAreaVerde = "GKrND2lyGc3ytXKp9MIa";
        var idServicioBasura = "NHxtpwBbEApglNuVbxv0";

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
            return idServicioBasura;
        }
        if (cAreaVerde >= 3) {
            //Area verde
            return idAreaVerde;
        }
        if (cAlumbrado >= 2) {
            //Alumbrado
            return idAlumbradoPublico;
        }
        if (cCalle >= 2) {
            //Via publica
            return idViaPublica;
        }

        return "0";
    }

    static async obtenerDenuncias() {
        var response = new ResponseResult();

        const denRef = db.collection("denuncias");
        const snap = await denRef.get();

        const tdRef = db.collection("tipoDenuncia");
        const tdSnap = await tdRef.get();

        var denuncias = [];
        for (let i = 0; i < snap.docs.length; i++) {
            var den = new Denuncia();
            den.getFromDbAll(snap.docs[i].data());
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


        var tiposDenuncia = [];
        for (let i = 0; i < tdSnap.docs.length; i++) {
            var td = new TipoDenuncia();
            td.tdId = tdSnap.docs[i].id;
            td.tdTitulo = tdSnap.docs[i].data().tdTitulo;
            tiposDenuncia.push(td);
        }

        var respData = {
            tds: tiposDenuncia,
            ests: estados,
            denuncias: denuncias
        };

        response.ok = true;
        response.msg = "Denuncias obtenidas correctamente";
        response.data = respData;
        return response;
    }



    static async obtenerPropietarioDen(usuEmail) {
        var response = new ResponseResult();
        var usuDb = await db.collection("usuarios").where("usuEmail", "==", usuEmail).get();
        if (usuDb.empty) {
            response.ok = false;
            response.msg = "No existe el usuario";
            return response;
        }

        var usuario = new Usuario();
        usuario.getFromDb(usuDb.docs[0].data());
        const userSegip = await Image.findOne({ ci: usuario.usuCI });
        const imageSegip = userSegip.imageData.toString("base64");

        response.ok = true;
        response.msg = "Usuario encontrado"
        response.data = {
            usuCI: usuario.usuCI,
            usuNombre: usuario.usuNombre,
            usuPaterno: usuario.usuPaterno,
            usuMaterno: usuario.usuMaterno,
            usuEmail: usuario.usuEmail,
            usuDireccion: usuario.usuDireccion,
            usuFoto: imageSegip
        };
        return response;

    }

    static async rechazarDenuncia(data) {
        var result = new ResponseResult();

        data.drFunc = "pedroperez@gmail.com";
        var review = new DenReview();
        review.fromWebCambio(data);
        review.drEstado = 1;

        const ESTADORECHAZADO = 0; //0 es rechazada
        await db.collection("denuncias").doc(review.drDen).update({
            "denEstado": ESTADORECHAZADO
        });

        await db.collection("denReview").add(review.toFirestore());

        var denDoc = await db.collection("denuncias").doc(review.drDen).get();
        var usuDenEmail = denDoc.data().denUsu;
        var usuSnap = await db.collection("usuarios").where("usuEmail", "==", usuDenEmail).get();
        var usuDoc = usuSnap.docs[0].data();
        var tieneToken = "usuToken" in usuDoc;
        if (tieneToken && usuDoc.usuToken != "") {
            var registrationToken = usuDoc.usuToken;
            var message = {
                data: {
                    estado: "Denuncia rechazada",
                    comentario: review.drComentario
                },
                token: registrationToken
            };
            await messaging.send(message)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                })
                .catch((error) => {
                    result.ok = false;
                    result.msg = "Excepcion al enviar notificacion" + error;
                    console.log('Error sending message:', error);
                });
            if (!result.ok) {
                return result;
            }
        }

        result.ok = true;
        result.msg = "Se rechazo la denuncia correctamente";

        return result;
    }

    static async aceptarDenuncia(data) {
        var result = new ResponseResult();

        data.drFunc = "pedroperez@gmail.com";
        var review = new DenReview();
        review.fromWebCambio(data);
        review.drEstado = 1;

        const ESTADOACEPTADO = 2; //2 es aceptado
        await db.collection("denuncias").doc(review.drDen).update({
            "denEstado": ESTADOACEPTADO
        });

        await db.collection("denReview").add(review.toFirestore());

        var denDoc = await db.collection("denuncias").doc(review.drDen).get();
        var usuDenEmail = denDoc.data().denUsu;
        var usuSnap = await db.collection("usuarios").where("usuEmail", "==", usuDenEmail).get();
        var usuDoc = usuSnap.docs[0].data();
        var tieneToken = "usuToken" in usuDoc;
        if (tieneToken && usuDoc.usuToken != "") {
            var registrationToken = usuDoc.usuToken;
            var message = {
                data: {
                    estado: "Denuncia aceptada",
                    comentario: review.drComentario
                },
                token: registrationToken
            };
            await messaging.send(message)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                })
                .catch((error) => {
                    result.ok = false;
                    result.msg = "Excepcion al enviar notificacion" + error;
                    console.log('Error sending message:', error);
                });
            if (!result.ok) {
                return result;
            }
        }

        result.ok = true;
        result.msg = "Se aprobo la denuncia correctamente";

        return result;
    }

}

module.exports = DenunciaController;