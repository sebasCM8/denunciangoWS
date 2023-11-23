class ResultadoRespuesta {
    static RESPUESTA_EXITO = 1;
    static RESPUESTA_FALLO = 0;

    constructor() {
        this.ok = ResultadoRespuesta.RESPUESTA_FALLO;
        this.msg = "";
        this.datos = "";
    }

    respuestaOk() {
        return this.ok == ResultadoRespuesta.RESPUESTA_EXITO;
    }
}

module.exports = ResultadoRespuesta;