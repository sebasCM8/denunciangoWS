const GenericOps = require("../helpers/genericops");
const ResponseResult = require("../models/responseresult");
const Usuario = require("../models/usuario");
const { db } = require("../database/firestore");
const ParametrosController = require("./parametrosCtrl");
const Image = require("../models/image");
const sendEmail = require("../helpers/sendGridUtils");
const { compareFaces } = require("../helpers/awsUtils");
const Rol = require("../models/rol");
const RolUsu = require("../models/rolusu");

class UsuarioCtrl {
    constructor() { }

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
            usuNombre: usuario.usuNombre,
            usuPaterno: usuario.usuPaterno,
            usuMaterno: usuario.usuMaterno,
            usuEmail: usuario.usuEmail,
            usuPass: usuario.usuPass,
            usuLat: "",
            usuLng: "",
            usuDireccion: usuario.usuDireccion,
            usuBloqueado: false,
            usuCantidadIntentos: 0,
            usuFechaBloqueo: "",
            usuFechaUltPass: fechaActual,
        };

        let docId;
        await usersCollection
            .add(newUser)
            .then((docRef) => {
                docId = docRef.id;
            })
            .catch((error) => {
                response.ok = false;
                response.msg = "Error al registrar el usuario"; //
                return response;
            });

        response.ok = true;
        response.msg = "Registrado exitosamente"; //
        response.data = docId;

        return response;
    }

    static async registrarFuncionario(data) {
        var result = new ResponseResult();

        var theusu = new Usuario();
        theusu.usuNombre = data.usuNombre;
        theusu.usuPaterno = data.usuPaterno;
        theusu.usuMaterno = data.usuMaterno;
        theusu.usuCI = data.usuCI;
        theusu.usuEmail = data.usuEmail;
        theusu.usuPass = data.usuPass;
        theusu.usuFechaBloqueo = "";
        theusu.usuFechaUltPass = GenericOps.getDateTime();
        var usuExiste = await db.collection("usuarios").where("usuEmail", "==", theusu.usuEmail).get();
        if (usuExiste.empty) {
            await db.collection("usuarios").add(theusu.toApiResp());
        }

        var regFunc = await db.collection("rolusu").
            where("ruEstado", "==", 1).
            where("ruUsu", "==", theusu.usuEmail).
            where("ruRol", "==", Rol.FUNCIONARIO).get();
        if (!regFunc.empty) {
            result.ok = false;
            result.msg = "El usuario ya esta registrado como funcionario";
            return result;
        }

        var ru = new RolUsu();
        ru.ruUsu = theusu.usuEmail;
        ru.ruRol = Rol.FUNCIONARIO;
        ru.ruEstado = 1;
        await db.collection("rolusu").add(ru.toFirestore());

        result.ok = true;
        result.msg = "El usuario se registro como funcionario exitosamente";

        return result;
    }

    static async loginWeb(data){
        var result = new ResponseResult();

        var email = data.usuEmail;
        var pass = data.usuPass;
        var usudb = await db.collection("usuarios").where("usuEmail", "==", email).get();
        if(usudb.empty){
            result.ok = false;
            result.msg = "Datos incorrectos";
            return result;
        }

        var theUsu = new Usuario();
        theUsu.getFromDb(usudb.docs[0].data());
        if(theUsu.usuPass != pass){
            result.ok = false;
            result.msg = "Datos incorrectos";
            return result;
        }

        var regTrab = await db.collection("rolusu").where("ruUsu", "==", email).get();
        if(regTrab.empty){
            result.ok = false;
            result.msg = "Usuario no es funcionario o administrador";
            return result;
        }

        result.ok = true;
        result.msg = "Login exitoso";

        return result;
    }
}

module.exports = UsuarioCtrl;