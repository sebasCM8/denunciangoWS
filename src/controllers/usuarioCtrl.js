const GenericOps = require("../models/genericops");
const ResponseResult = require("../models/responseresult");
const Usuario = require("../models/usuario");
const db = require("../database/firestore");
const MISPARAMS = require("./misParams");
const Image = require("../models/image");
const sendEmail = require("../helpers/sendGridUtils");
const compareFaces = require("../helpers/awsUtils");

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
    //ya no se necesita
    var response = new ResponseResult();
    var userSegip = await Image.findOne({ ci: ci });
    if (userSegip == null) {
      response.ok = false;
      response.msg = "Carnet no registrado en el SEGIP";
      return response;
    }
    var usuariosRef = db.collection("usuarios");
    var snapshot = await usuariosRef.where("usuCI", "==", ci).get();
    if (!snapshot.empty) {
      response.ok = false;
      response.msg = "Ya existe un usuario registrado con ese CI";
      return response;
    }
    response.ok = true;
    response.msg = "CI encontrado";
    return response;
  }

  static async registroVerificarFotoCI(ci, imageApp) {
    //la imageApp ya esta en string base64
    var response = new ResponseResult();
    var userSegip = await Image.findOne({ ci: ci });

    if (userSegip == null) {
      response.ok = false;
      response.msg = "Datos de cedula de identidad no validos";
      return response;
    }

    var usuariosRef = db.collection("usuarios");
    var snapshot = await usuariosRef.where("usuCI", "==", ci).get();
    if (!snapshot.empty) {
      response.ok = false;
      response.msg = "Usuario ya registrado";
      return response;
    }
    //convierte la imagen del user segip a base64
    const imageSegip = userSegip.imageData.toString("base64");
    let porcentajeSimilitud;
    await compareFaces(imageSegip, imageApp)
      .then((similitud) => {
        porcentajeSimilitud = similitud;
      })
      .catch(() => {
        response.ok = false;
        response.msg = "Error al comparar rostros";
        return response;
      });

    if (porcentajeSimilitud < 90) {
      //Aqui entra si la foto no coincide con la del segip
      response.ok = false;
      response.msg = "Los datos no coinciden, intentar de nuevo";
      return response;
    }
    const datoUsuSegip = {
      nombre: userSegip.nombre,
      paterno: userSegip.paterno,
      materno: userSegip.materno,
      ci: userSegip.ci
    }
    response.ok = true;
    response.msg = "Verificacion de identidad exitosa";
    response.data = datoUsuSegip;
    return response;
  }

  static async registroVerificarCorreo(email) {
    var response = new ResponseResult();
    var usuariosRef = db.collection("usuarios");
    var snapshot = await usuariosRef.where("usuEmail", "==", email).get();
    if (!snapshot.empty) {
      response.ok = false;
      response.msg = "Ya existe un usuario registrado con ese correo";
      return response;
    }
    let code;
    await sendEmail(email)
      .then((codigo) => {
        code = codigo;
      })
      .catch((error) => {
        response.ok = false;
        response.msg =
          "Error al enviar el correo con el codigo de verificacion";
        return response;
      });
    response.ok = true;
    response.msg = "Codigo de verificacion enviado";
    response.data = code;
    return response;
  }

  static async registroFinalizado(usuario) {
    var response = new ResponseResult();
    const usersCollection = db.collection("usuarios");
    var fechaActual = GenericOps.getDateTime();

    // Crear un nuevo documento en la colección de usuarios
    const newUser = {
      usuCI: usuario.usuCI,
      usuNombre: usuNombre,
      usuPaterno: usuPaterno,
      usuMaterno: usuMaterno,
      usuEmail: "",
      usuPass: "",
      usuLat: "",
      usuLng: "",
      usuDireccion: "",
      usuBloqueado: false,
      usuCantidadIntentos: 0,
      usuFechaBloqueo: fechaActual,
      usuFechaUltPass: fechaActual,
    };

    let docId;
    await usersCollection
      .add(newUser)
      .then((docRef) => {
        docId = docRef.id;
      })
      .catch((error) => {
        response.ok = true;
        response.msg = "Error al registrar el usuario"; //
      });

    response.ok = true;
    response.msg = "Usuario registrado"; //
    response.data = {
      id: docId,
    };

    return response;
  }
}

module.exports = UsuarioCtrl;
