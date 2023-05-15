const GenericOps = require("../models/genericops");
const ResponseResult = require("../models/responseresult");
const Usuario = require("../models/usuario");
const db = require("../firestoreHelper");
const MISPARAMS = require("./misParams");

class UsuarioCtrl {
    constructor() {

    }

    static async login(email, password) {
        var response = new ResponseResult();

        var usuariosRef = db.collection("usuarios");
        var snapshot = await usuariosRef.where("usuEmail", "==", email).get();
        if (snapshot.empty) {
            response.ok = false;
            response.msg = "El email no esta registrado";
            return response;
        }
        var theUser = new Usuario();
        theUser.getFromDb(snapshot.docs[0].data());
        
        if(theUser.usuBloqueado){
            response.ok = false;
            response.msg = "Usuario bloqueado, intente mas tarde";
            return response;
        }

        if(theUser.usuPass != password){
            theUser.usuCantidadIntentos ++;
            if(theUser.usuCantidadIntentos == MISPARAMS.LOGININTENTOS){
                theUser.usuBloqueado = true;
            }
        }
        

        response.ok = true;
        response.msg = "Sesion iniciada correctamente";
        response.data = theUser.toApiResp();
        return response;
    }

    static async checkCI(usrCI) {
        var respObj = new ResponseResult();
        if (GenericOps.checkValidInteger(usrCI)) {
            respObj.ok = false;
            respObj.msg = "CI no valido";
            return respObj.getResponseData();
        }


    }
}

module.exports = UsuarioCtrl;