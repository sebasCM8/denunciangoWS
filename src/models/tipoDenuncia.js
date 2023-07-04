class TipoDenuncia {
    constructor() {
        this.tdId = 0;
        this.tdTitulo = "";
        this.tdDesc = "";
        this.tdEstado = 0;
    }

    toFirestore() {
        var obj = {
            tdTitulo: this.tdTitulo,
            tdDesc: this.tdDesc,
            tdEstado: this.tdEstado
        };
        return obj;
    }

    fromWebReg(data) {
        this.tdTitulo = data.tdTitulo;
        this.tdDesc = data.tdDesc;
    }

    fromFirestore(data) {
        this.tdTitulo = data.tdTitulo;
        this.tdDesc = data.tdDesc;
        this.tdEstado = data.tdEstado;
    }
}

module.exports = TipoDenuncia;