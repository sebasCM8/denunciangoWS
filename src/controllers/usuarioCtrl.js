const GenericOps = require("../models/genericops");
const ResponseResult = require("../models/responseresult");
const Usuario = require("../models/usuario");
const db = require("../database/firestore");
const MISPARAMS = require("./misParams");
const Image = require("../models/image");


class UsuarioCtrl {
  constructor() {}

  static terminoBloqueo(hoy, fechaBloqueo) {
    var minutos = GenericOps.calculateMinutes(fechaBloqueo, hoy);
    if (minutos <= MISPARAMS.LOGINTIEMPOBLOQUEO) {
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
      var termBloqueo = this.terminoBloqueo(hoy, theUser.usuFechaBloqueo);
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
        usuBloqueado: theUser.usuBloqueado,
        usuCantidadIntentos: theUser.usuCantidadIntentos,
        usuFechaBloqueo: theUser.usuFechaBloqueo,
      });
    }

    if (theUser.usuPass != password) {
      theUser.usuCantidadIntentos++;
      if (theUser.usuCantidadIntentos == MISPARAMS.LOGININTENTOS) {
        theUser.usuBloqueado = true;
        theUser.usuFechaBloqueo = GenericOps.getDateTime();

        //actualizar db
        await usuariosRef.doc(docId).update({
          usuBloqueado: theUser.usuBloqueado,
          usuCantidadIntentos: theUser.usuCantidadIntentos,
          usuFechaBloqueo: theUser.usuFechaBloqueo,
        });

        response.ok = false;
        response.msg = "Usuario bloqueado, intente mas tarde";
        return response;
      }

      //actualizar db
      await usuariosRef.doc(docId).update({
        usuCantidadIntentos: theUser.usuCantidadIntentos,
      });

      response.ok = false;
      response.msg = "Datos incorrectos";
      return response;
    }

    theUser.usuCantidadIntentos = 0;

    //actualizar db
    await usuariosRef.doc(docId).update({
      usuCantidadIntentos: theUser.usuCantidadIntentos,
    });

    response.ok = true;
    response.msg = "Sesion iniciada correctamente";
    response.data = theUser.toApiResp();
    return response;
  }

  static async registroVerificarCarnet(ci) {
    var response = new ResponseResult();
    var img = await Image.findOne({ci: ci})
    if (img == null) {
      response.ok = false;
      response.msg = "Carnet no registrado en el SEGIP"; //
      console.log("ci no registrado");
      return response;
    }
    response.ok = true;
    response.msg = "CI encontrado"; //
    console.log("CI encontrado");
    return response;
  }


  static async registroVerificarFoto(ci, imageusu) {
    var response = new ResponseResult();
    var img = await Image.findOne({ci: ci})
    if (img == null) {
      response.ok = false;
      response.msg = "Carnet no registrado en el SEGIP"; //
      console.log("ci no registrado");
      return response;
    }
    response.ok = true;
    response.msg = "CI encontrado"; //
    console.log("CI encontrado");
    return response;
  }



  static async registroVerificarCorreo(email) {
    var response = new ResponseResult();
    var img = await Image.findOne({ci: ci})
    if (img == null) {
      response.ok = false;
      response.msg = "Carnet no registrado en el SEGIP"; //
      console.log("ci no registrado");
      return response;
    }
    response.ok = true;
    response.msg = "CI encontrado"; //
    console.log("CI encontrado");
    return response;
  }


  static async registroFinalizado() {
    var response = new ResponseResult();
    var img = await Image.findOne({ci: ci})
    if (img == null) {
      response.ok = false;
      response.msg = "Carnet no registrado en el SEGIP"; //
      console.log("ci no registrado");
      return response;
    }
    response.ok = true;
    response.msg = "CI encontrado"; //
    console.log("CI encontrado");
    return response;
  }
}

module.exports = UsuarioCtrl;
