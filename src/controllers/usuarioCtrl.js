const GenericOps = require("../models/genericops");
const ResponseResult = require("../models/responseresult");
const Usuario = require("../models/usuario");
const db = require("../database/firestore");
const ParametrosController = require("./parametrosCtrl");

class UsuarioCtrl {
    constructor() {

    }

    static async terminoBloqueo(hoy, fechaBloqueo) {
        var minutos = GenericOps.calculateMinutes(fechaBloqueo, hoy);
        var paramLoginBloqueo = await ParametrosController.getLOGINTIEMPOBLOQUEO();
        if (minutos <= paramLoginBloqueo.parValor) {
            return false;
        }

        return true;
    }

    static async login(email, password) {
        var response = new ResponseResult();

        var usuariosRef = db.collection("usuarios");
        var snapshot = await usuariosRef.where("usuEmail", "==", email).get();
        if (snapshot.empty) {
            response.ok = false;
            response.msg = "Datos incorrectos";
            return response;
        }
        var theUser = new Usuario();
        var docId = snapshot.docs[0].id;
        theUser.getFromDb(snapshot.docs[0].data());

        if (theUser.usuBloqueado) {
            var hoy = GenericOps.getDateTime();
            var termBloqueo = await this.terminoBloqueo(hoy, theUser.usuFechaBloqueo);
            if (!termBloqueo) {
                response.ok = false;
                response.msg = "Usuario bloqueado, intente mas tarde";
                return response;
            }

            theUser.usuBloqueado = false;
            theUser.usuCantidadIntentos = 0;
            theUser.usuFechaBloqueo = "";
            //actualizar db
            await usuariosRef.doc(docId).update({
                "usuBloqueado": theUser.usuBloqueado,
                "usuCantidadIntentos": theUser.usuCantidadIntentos,
                "usuFechaBloqueo": theUser.usuFechaBloqueo
            });
        }

        if (theUser.usuPass != password) {
            theUser.usuCantidadIntentos++;
            var paramLoginIntentos = await ParametrosController.getLOGININTENTOS();
            if (theUser.usuCantidadIntentos == paramLoginIntentos.parValor) {
                theUser.usuBloqueado = true;
                theUser.usuFechaBloqueo = GenericOps.getDateTime();

                //actualizar db
                await usuariosRef.doc(docId).update({
                    "usuBloqueado": theUser.usuBloqueado,
                    "usuCantidadIntentos": theUser.usuCantidadIntentos,
                    "usuFechaBloqueo": theUser.usuFechaBloqueo
                });

                response.ok = false;
                response.msg = "Usuario bloqueado, intente mas tarde";
                return response;
            }

            //actualizar db
            await usuariosRef.doc(docId).update({
                "usuCantidadIntentos": theUser.usuCantidadIntentos
            });

            response.ok = false;
            response.msg = "Datos incorrectos";
            return response;
        }

        theUser.usuCantidadIntentos = 0;

        //actualizar db
        await usuariosRef.doc(docId).update({
            "usuCantidadIntentos": theUser.usuCantidadIntentos
        });

        response.ok = true;
        response.msg = "Sesion iniciada correctamente";
        response.data = theUser.toApiResp();
        return response;
    }

    static async cambiarPassword(email) {
        var response = new ResponseResult();

        var usuariosRef = db.collection("usuarios").where("usuEmail", "==", email);
        var snapshot = await usuariosRef.get();
        if (snapshot.empty) {
            response.ok = false;
            response.msg = "Email no existe";
            return response;
        }

        var theUser = new Usuario();
        theUser.getFromDb(snapshot.docs[0].data());

        var hoy = GenericOps.getDateTime();
        var minutos = GenericOps.calculateMinutes(theUser.usuFechaUltPass, hoy);
        var horas = Math.floor(minutos / 60);
        var dias = Math.floor(horas / 24);
        var paramTiempoPassword = await ParametrosController.getTIEMPOPASSWORD();
        if (dias <= paramTiempoPassword.parValor) {
            response.msg = "No es necesario cambiar su password aun";
            response.data = false;
        } else {
            response.msg = "Debe cambiar su password";
            response.data = true;
        }
        response.ok = true;

        return response;
    }

    static async actualizarPassword(email, password) {
        var response = new ResponseResult();

        var usuariosRef = db.collection("usuarios");
        var snapshot = await usuariosRef.where("usuEmail", "==", email).get();
        if (snapshot.empty) {
            response.ok = false;
            response.msg = "Email no existe";
            return response;
        }

        var docId = snapshot.docs[0].id;
        var theUser = new Usuario();
        theUser.getFromDb(snapshot.docs[0].data());

        var paramPassLength = await ParametrosController.getPASSLENGTH();
        if (password.length < paramPassLength.parValor) {
            response.ok = false;
            response.msg = "El password debe tener al menos " + paramPassLength.parValor + " caracteres";
            return response;
        }
        var passwordValida = GenericOps.validatePassword(password);
        if (!passwordValida) {
            response.ok = false;
            response.msg = "Password no valida";
            return response;
        }
        if (password == theUser.usuPass) {
            response.ok = false;
            response.msg = "El nuevo password no puede ser el mismo que el anterior";
            return response;
        }

        //actualizar db
        var hoy = GenericOps.getDateTime();
        await usuariosRef.doc(docId).update({
            "usuPass": password,
            "usuFechaUltPass": hoy
        });
        response.ok = true;
        response.msg = "Password actualizado correctamente";

        return response;
    }
}

module.exports = UsuarioCtrl;
