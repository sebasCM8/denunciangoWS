class AreTd {
    constructor() {
        this.atId = "";
        this.atAre = "";
        this.atTd = "";
        this.atEstado = 0;
    }

    toFirestore() {
        var obj = {
            atAre: this.atAre,
            atTd: this.atTd,
            atEstado: this.atEstado
        };
        return obj;
    }

}

module.exports = AreTd;