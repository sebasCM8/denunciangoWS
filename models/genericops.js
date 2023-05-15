class GenericOps {
    constructor() { }

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

    static checkValidInteger(theNumber) {
        return false;
    }


}

module.exports = GenericOps;