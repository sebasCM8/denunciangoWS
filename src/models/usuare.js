class UsuAre {
    constructor() {
        this.uaId = "";
        this.uaUsu = "";
        this.uaAre = "";
        this.uaEstado = 0;
    }

    toFirestore() {
        var obj = {
            uaUsu: uaUsu,
            uaAre: uaAre,
            uaEstado: uaEstado
        };
        return obj;
    }
}

module.exports = UsuAre;