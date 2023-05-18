class Usuario {
    constructor() {
        this.usuCI = "";
        this.usuNombre = "";
        this.usuPaterno = "";
        this.usuMaterno = "";
        this.usuEmail = "";
        this.usuPass = "";
        this.usuLat = "";
        this.usuLng = "";
        this.usuDireccion = "";
        this.usuBloqueado = false;
        this.usuCantidadIntentos = 0;
        this.usuFechaBloqueo = "2023-05-13 22:27";
        this.usuFechaUltPass = "2023-05-13 22:27";
    }

    getFromDb(usrData) {
        this.usuCI = usrData["usuCI"];
        this.usuNombre = usrData["usuNombre"];
        this.usuPaterno = usrData["usuPaterno"];
        this.usuMaterno = usrData["usuMaterno"];
        this.usuEmail = usrData["usuEmail"];
        this.usuPass = usrData["usuPass"];
        this.usuLat = usrData["usuLat"];
        this.usuLng = usrData["usuLng"];
        this.usuDireccion = usrData["usuDireccion"];
        this.usuBloqueado = usrData["usuBloqueado"];
        this.usuCantidadIntentos = usrData["usuCantidadIntentos"];
        this.usuFechaBloqueo = usrData["usuFechaBloqueo"];
        this.usuFechaUltPass = usrData["usuFechaUltPass"];
    }

    toApiResp() {
        var usrData = {
            usuCI: this.usuCI,
            usuNombre: this.usuNombre,
            usuPaterno: this.usuPaterno,
            usuMaterno: this.usuMaterno,
            usuEmail: this.usuEmail,
            usuPass: this.usuPass,
            usuLat: this.usuLat,
            usuLng: this.usuLng,
            usuDireccion: this.usuDireccion,
            usuBloqueado: this.usuBloqueado,
            usuCantidadIntentos: this.usuCantidadIntentos,
            usuFechaBloqueo: this.usuFechaBloqueo,
            usuFechaUltPass: this.usuFechaUltPass
        };
        return usrData;
    }

}

module.exports = Usuario;