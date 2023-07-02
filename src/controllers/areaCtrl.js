const ResponseResult = require("../models/responseresult");
const Area = require("../models/area");
const { db } = require("../database/firestore");

class AreaController{
    static async registrarArea(data){
        var result = new ResponseResult();

        var are = new Area();
        are.getFromWebReg(data);
        are.areEstado = 1;
        await db.collection("areas").add(are.toFirestore());

        result.ok = true;
        result.msg = "Nueva area registrada";

        return result;
    }

    static async obtenerAreas(){
        var result = new ResponseResult();

        var denuncias = await db.collection("areas").where("areEstado", "==", 1).get();
        for(let i = 0; i < denuncias.docs.length; i++){
            
        }

        return result;
    }
}

module.exports = AreaController;