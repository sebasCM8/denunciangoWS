class Denuncia {

    constructor() {
        this.denId = 0;
        this.denTitulo = "";
        this.denDescripcion = "";
        this.denTipo = 0;
        this.denUsu = "";
        this.denEstado = 0;
        this.denFecha = "";
        this.denHora = "";
        this.denLat = "";
        this.denLng = "";
    }

    getFromDb(denData) {
        //this.denId = denData.denId;
        this.denTitulo = denData.denTitulo;
        this.denDescripcion = denData.denDescripcion;
        this.denTipo = denData.denTipo;
        this.denUsu = denData.denUsu;
        //this.denEstado = denData.denEstado;
        //this.denFecha = denData.denFecha;
        //this.denHora = denData.denHora;
        this.denLat = denData.denLat;
        this.denLng = denData.denLng;
    }

    toDbmap() {
        var data = {
            denTitulo: this.denTitulo,
            denDescripcion: this.denDescripcion,
            denTipo: this.denTipo,
            denUsu: this.denUsu,
            denEstado: this.denEstado,
            denFecha: this.denFecha,
            denHora: this.denHora,
            denLat: this.denLat,
            denLng: this.denLng
        };
        return data;
    }

}

module.exports = Denuncia;