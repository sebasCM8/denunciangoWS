const ResultadoRespuesta = require("../models/resultadoRespuesta");
const Alerta = require("../models/alerta");
const { db } = require("../database/firestore");
const { storage } = require("../database/cloudStorage");
const { ref, uploadString, getDownloadURL } = require("firebase/storage");


class AlertaCtrl {
    static async registrarAlerta(alertaDatos) {
        var resultado = new ResultadoRespuesta();

        var nuevaAlerta = new Alerta();
        nuevaAlerta.datosDesdeRegistro(alertaDatos);

        var datos = nuevaAlerta.alertaAFirestore();
        console.log(datos);
        var resp = await db.collection("alertas").add(datos);
        nuevaAlerta.aleId = resp.id;

        if (alertaDatos.aleImagenContenido != null && alertaDatos.aleImagenContenido != "") {
            nuevaAlerta.aleImagenContenido = alertaDatos.aleImagenContenido;
            var nombreImagen = nuevaAlerta.aleId + "01.txt";

            const storageRef = ref(storage, nombreImagen);
            await uploadString(storageRef, nuevaAlerta.aleImagenContenido);

            nuevaAlerta.aleImagen = nombreImagen;

            const alertaRef = db.collection("alertas").doc(nuevaAlerta.aleId);
            var datos2 = nuevaAlerta.actualizarImagenDatos();
            const resp2 = await alertaRef.update(datos2);
        }

        resultado.ok = ResultadoRespuesta.RESPUESTA_EXITO;
        resultado.msg = "Alerta registrada exitosamente";
        resultado.datos = nuevaAlerta;
        return resultado;
    }
}

module.exports = AlertaCtrl;