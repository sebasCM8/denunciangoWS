class TipoDenuncia {
    constructor() {
        this.tdId = 0;
        this.tdTitulo = "";
    }

    getFromDb(tdData) {
        this.tdId = tdData.tdId;
        this.tdTitulo = tdData.tdTitulo;
    }
}

module.exports = TipoDenuncia;