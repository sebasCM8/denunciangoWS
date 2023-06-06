class GenericOps {
    constructor() { }

    static calculateMinutes(fIni, fFin) {
        var fIniParts = fIni.split(" ");
        var fIniFecha = fIniParts[0];
        var fIniHora = fIniParts[1];
        var fIniFechaParts = fIniFecha.split("-");
        var fIniHoraParts = fIniHora.split(":");
        var fIniMes = parseInt(fIniFechaParts[1]) - 1;
        var dateIni = new Date(fIniFechaParts[0], fIniMes.toString(), fIniFechaParts[2],
            fIniHoraParts[0], fIniHoraParts[1], fIniHoraParts[2]);

        var fFinParts = fFin.split(" ");
        var fFinFecha = fFinParts[0];
        var fFinHora = fFinParts[1];
        var fFinFechaParts = fFinFecha.split("-");
        var fFinHoraParts = fFinHora.split(":");
        var fFinMes = parseInt(fFinFechaParts[1]) - 1;
        var dateFin = new Date(fFinFechaParts[0], fFinMes.toString(), fFinFechaParts[2],
            fFinHoraParts[0], fFinHoraParts[1], fFinHoraParts[2]);

        var miliSecDiff = dateFin - dateIni;
        var secs = Math.floor(miliSecDiff / 1000);
        var mins = Math.floor(secs / 60);

        return mins;
    }

    static getDateTime() {
        var d = new Date();
        var theMonth = d.getMonth() + 1;
        var theDay = d.getDate();

        var theDate = d.getFullYear() + "-" + theMonth.toString() + "-" + theDay.toString();

        var t = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

        var result = theDate + " " + t;
        return result;
    }

    static validatePassword(password) {
        var tieneEspacios = password.search(" ");
        if (tieneEspacios != -1) {
            return false;
        }

        var tieneLetras = password.search(/[a-zA-Z]/);
        if (tieneLetras == -1) {
            return false;
        }

        var tieneNumeros = password.search(/[0-9]/);
        if (tieneNumeros == -1) {
            return false;
        }

        var tieneCaracteres = password.search(/[_)(}{+*$.-]/);
        if (tieneCaracteres == -1) {
            return false;
        }

        return true;
    }

    static generateVerificationCode() {
        const min = 1000; // El número mínimo de 4 dígitos
        const max = 9999; // El número máximo de 4 dígitos

        // Generar un número aleatorio en el rango específico
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

        return randomNumber;
    };

    static initializeDate(d1) {
        var dateParts = d1.split(" ");
        var dateFecha = dateParts[0];
        var dateHora = dateParts[1];
        var dateFechaParts = dateFecha.split("-");
        var dateHoraParts = dateHora.split(":");
        var dateMes = parseInt(dateFechaParts[1]) - 1;
        var dateObj = new Date(dateFechaParts[0], dateMes.toString(), dateFechaParts[2],
            dateHoraParts[0], dateHoraParts[1], dateHoraParts[2]);
        return dateObj;
    }

}

module.exports = GenericOps;