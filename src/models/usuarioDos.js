class UsuarioDos {
    constructor() {
        this.udId = "";
        this.udNombre = "";
        this.udApellidos = "";
        this.udCI = "";
        this.udPass = "";
        this.udDireccion = "";
        this.udCelularId = "";
        this.udLatitud = 0;
        this.udLongitud = 0;
    }

    datosDesdeRegistro(datosUd) {
        this.udNombre = datosUd.udNombre;
        this.udApellidos = datosUd.udApellidos;
        this.udCI = datosUd.udCI;
        this.udPass = datosUd.udPass;
        this.udDireccion = datosUd.udDireccion;
        this.udCelularId = datosUd.udCelularId;
        this.udLatitud = datosUd.udLatitud;
        this.udLongitud = datosUd.udLongitud;
    }

    datosAFirestore() {
        var datos = {
            udNombre: this.udNombre,
            udApellidos: this.udApellidos,
            udCI: this.udCI,
            udPass: this.udPass,
            udDireccion: this.udDireccion,
            udCelularId: this.udCelularId,
            udLatitud: this.udLatitud,
            udLongitud: this.udLongitud
        };
        return datos;
    }

    datosLogin(udData) {
        this.udCI = udData.udCI;
        this.udPass = udData.udPass;
    }

    datosDesdeFirestore(registro) {
        this.udNombre = registro.udNombre;
        this.udApellidos = registro.udApellidos;
        this.udCI = registro.udCI;
        this.udPass = registro.udPass;
        this.udDireccion = registro.udDireccion;
        this.udCelularId = registro.udCelularId;
        this.udLatitud = registro.udLatitud;
        this.udLongitud = registro.udLongitud;
    }

}

module.exports = UsuarioDos;