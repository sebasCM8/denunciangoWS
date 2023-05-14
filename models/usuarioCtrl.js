const GenericOps = require("./genericops");
const ResponseResult = require("./responseresult");

class UsuarioCtrl {
    constructor() {

    }

    async login(email, password){
        var response = new ResponseResult();

        return response;
    }

    async checkCI(usrCI) {
        var respObj = new ResponseResult();
        if (GenericOps.checkValidInteger(usrCI)) { 
            respObj.ok = false;
            respObj.msg = "CI no valido";
            return respObj.getResponseData();
        }


    }
}