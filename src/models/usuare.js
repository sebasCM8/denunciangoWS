class UsuAre {
    constructor() {
        this.uaId = "";
        this.uaUsu = "";
        this.uaAre = "";
        this.uaEstado = 0;
    }

    toFirestore() {
        var obj = {
            uaUsu: this.uaUsu,
            uaAre: this.uaAre,
            uaEstado: this.uaEstado
        };
        return obj;
    }
}

module.exports = UsuAre;