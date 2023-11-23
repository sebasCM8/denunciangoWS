class Alerta {
    constructor() {
        this.aleId = "";
        this.aleDescripcion = "";
        this.aleImagen = "";
        this.alePersona = "";
        this.aleLatitud = 0;
        this.aleLongitud = 0;
        this.aleIdDispositivo = "";
        this.aleModelo = "";

        this.aleImagenContenido = "";
    }

    datosDesdeRegistro(datosAlerta) {
        this.aleDescripcion = datosAlerta["aleDescripcion"];
        this.alePersona = datosAlerta.alePersona;
        this.aleLatitud = datosAlerta.aleLatitud;
        this.aleLongitud = datosAlerta.aleLongitud;
        this.aleIdDispositivo = datosAlerta.aleIdDispositivo;
        this.aleModelo = datosAlerta.aleModelo;
    }

    alertaAFirestore() {
        var datos = {
            aleDescripcion: this.aleDescripcion,
            aleImagen: this.aleImagen,
            alePersona: this.alePersona,
            aleLatitud: this.aleLatitud,
            aleLongitud: this.aleLongitud,
            aleIdDispositivo: this.aleIdDispositivo,
            aleModelo: this.aleModelo
        };
        return datos;
    }

    actualizarImagenDatos() {
        var datos = {
            aleImagen: this.aleImagen
        };
        return datos;
    }
}

module.exports = Alerta;