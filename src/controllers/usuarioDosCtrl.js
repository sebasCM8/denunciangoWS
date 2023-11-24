const { db, messaging } = require("../database/firestore");

const UsuarioDos = require("../models/usuarioDos");
const ResultadoRespuesta = require("../models/resultadoRespuesta");

class UsuarioDosCtrl {

    static CLT_NAME = "usuarioDos";

    static async registrarUsuario(udDatos) {
        var resultado = new ResultadoRespuesta();

        var nuevoUD = new UsuarioDos();
        nuevoUD.datosDesdeRegistro(udDatos);

        var existeCI = await this.existeUsuario(nuevoUD.udCI);
        if (existeCI) {
            resultado.ok = ResultadoRespuesta.RESPUESTA_FALLO;
            resultado.msg = "El CI " + nuevoUD.udCI + " ya fue registrado";
            return resultado;
        }

        var datos = nuevoUD.datosAFirestore();

        var resp = await db.collection(this.CLT_NAME).add(datos);
        nuevoUD.udId = resp.id;

        resultado.ok = ResultadoRespuesta.RESPUESTA_EXITO;
        resultado.msg = "Usuario registrado exitosamente";
        resultado.datos = nuevoUD;

        return resultado;
    }

    static async existeUsuario(ci) {
        var snapshot = await db.collection(this.CLT_NAME).where("udCI", "==", ci).get();
        if (snapshot.empty) {
            return false;
        }
        return true;
    }

    static async loginUsuario(udDatos) {
        var resultado = new ResultadoRespuesta();

        var udLogin = new UsuarioDos();
        udLogin.datosLogin(udDatos);

        var existeCI = await this.existeUsuario(udLogin.udCI);
        if (!existeCI) {
            resultado.ok = ResultadoRespuesta.RESPUESTA_FALLO;
            resultado.msg = "CI no registrado";
            return resultado;
        }

        var snapshot = await db.collection(this.CLT_NAME).where("udCI", "==", udLogin.udCI).get();
        //console.log(snapshot);
        var datos = snapshot.docs[0].data();
        //console.log("pass");
        if (datos.udPass != udLogin.udPass) {
            resultado.ok = ResultadoRespuesta.RESPUESTA_FALLO;
            resultado.msg = "Password incorrecta";
            return resultado;
        }

        udLogin.udId = snapshot.docs[0].id;
        udLogin.datosDesdeFirestore(datos);

        resultado.ok = ResultadoRespuesta.RESPUESTA_EXITO;
        resultado.msg = "Login exitoso";
        resultado.datos = udLogin;
        return resultado;
    }

    static async actualizarTokenCelular(datosUd) {
        var resultado = new ResultadoRespuesta();

        var udObj = new UsuarioDos();
        udObj.udId = datosUd.udId;
        udObj.udCelularId = datosUd.udCelularId;

        var datos = udObj.datosActualizarToken();

        const udRef = db.collection(this.CLT_NAME).doc(udObj.udId);
        await udRef.update(datos);

        resultado.ok = ResultadoRespuesta.RESPUESTA_EXITO;
        resultado.msg = "Se actualizo id del celular correctamente";
        return resultado;
    }

    static async enviarMensajeCelular(datosMensaje) {
        var resultado = new ResultadoRespuesta();

        var mensaje = {
            data: {
                alertaMensaje: datosMensaje.mensajeAlerta
            },
            token: datosMensaje.tokenCel
        };

        await messaging.send(mensaje)
            .then((response) => {
                resultado.ok = ResultadoRespuesta.RESPUESTA_EXITO;
                resultado.msg = "Mensaje enviado exitosamente";
            })
            .catch((error) => {
                resultado.ok = ResultadoRespuesta.RESPUESTA_FALLO;
                resultado.msg = "Excepcion al enviar mensaje: " + error;
            });

        return resultado;
    }
}

module.exports = UsuarioDosCtrl;