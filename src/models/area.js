class Area {
    constructor() {
        this.areId = "";
        this.areNombre = "";
        this.areDesc = "";
        this.areCelular = "";
        this.areDireccion = "";
        this.areEstado = 0;
    }

    getFromWebReg(data) {
        this.areNombre = data.areNombre;
        this.areDesc = data.areDesc;
        this.areCelular = data.areCelular;
        this.areDireccion = data.areDireccion;
    }
    
    getFromFirestore(data) {
        this.areNombre = data.areNombre;
        this.areDesc = data.areDesc;
        this.areCelular = data.areCelular;
        this.areDireccion = data.areDireccion;
        this.areEstado = data.areEstado;
    }

    toFirestore() {
        var obj = {
            areNombre: this.areNombre,
            areDesc: this.areDesc,
            areCelular: this.areCelular,
            areDireccion: this.areDireccion,
            areEstado: this.areEstado
        };
        return obj;
    }
}

module.exports = Area;