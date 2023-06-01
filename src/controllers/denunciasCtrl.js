const GenericOps = require("../helpers/genericops");
const tieneContenidoOfensivo = require("../helpers/openaiUtils");
const ResponseResult = require("../models/responseresult");
const Usuario = require("../models/usuario");
const { db } = require("../database/firestore");

const { compareFaces, detectarEtiquetas } = require("../helpers/awsUtils");

class DenunciaCtrl {
  constructor() {}

  static async denunciaPaso1(texto) {
    var response = new ResponseResult();
    var esOfensivo = "";
    try {
      esOfensivo = await tieneContenidoOfensivo(texto);
    } catch (e) {
      response.ok = false;
      response.msg = "Excepcion al verificar contenido ofensivo: " + e;
    }

    if (esOfensivo) {
        //Aqui entra si el contenido es ofensivo
        response.ok = false;
        response.msg = "La descripcion tiene contenido ofensivo";
        return response;
    }

    response.ok = true;
    response.msg = "Descripcion aprobada";
    response.data = esOfensivo;
    return response;
  }

  static async denunciaPaso2(imagen) {
    //la imagen ya esta en string base64
    var response = new ResponseResult();
    let allEtiquetas;

    await detectarEtiquetas(imagen)
      .then((etiquetas) => {
        allEtiquetas = etiquetas;
      })
      .catch(() => {
        response.ok = false;
        response.msg = "Error al obtener etiquetas";
        return response;
      });

    response.ok = true;
    response.msg = "Obtencion de etiquetas exitosa";
    response.data = allEtiquetas;
    return response;
  }
}

module.exports = DenunciaCtrl;
