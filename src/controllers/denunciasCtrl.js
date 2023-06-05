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

    let categoria =  this.clasificarImagen(allEtiquetas);

    response.ok = true;
    response.msg = "Obtencion de etiquetas exitosa";
    // response.data = arrayEtiquetas;
    response.data = categoria;
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
      return "BASURA";
    }
    if (cAreaVerde >= 3) {
      return "AREAVERDE";
    }
    if (cAlumbrado >= 2) {
      return "ALUMBRADO";
    }
    if (cCalle >= 2) {
      return "CALLE";
    }

    return "OTRO";
  }
}

module.exports = DenunciaCtrl;
