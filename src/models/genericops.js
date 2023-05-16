class GenericOps {
    constructor() { }

    static calculateMinutes(fIni, fFin) {
        var dateIni = new Date(fIni.substring(0, 4), fIni.substring(5, 7), fIni.substring(8, 10),
            fIni.substring(11, 13), fIni.substring(14, 16), fIni.substring(17));

        var dateFin = new Date(fFin.substring(0, 4), fFin.substring(5, 7), fFin.substring(8, 10),
            fFin.substring(11, 13), fFin.substring(14, 16), fFin.substring(17));

        var miliSecDiff = dateFin - dateIni;
        var secs = Math.floor(miliSecDiff / 1000);
        var mins = Math.floor(secs / 60);

        return mins;
    }

    static getDateTime() {
        var d = new Date();
        var theMonth = d.getMonth() + 1;
        var strMonth = theMonth.toString();
        if (theMonth < 10) {
            strMonth = "0" + theMonth.toString();
        }
        var theDate = d.getFullYear() + "-" + strMonth + "-" + d.getDate();

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

}

module.exports = GenericOps;