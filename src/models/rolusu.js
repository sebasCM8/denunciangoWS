class RolUsu{
    constructor(){
        this.ruId = "";
        this.ruUsu = "";
        this.ruRol = 0;
        this.ruEstado = 0;
    }

    toFirestore(){
        var obj = {
            ruRol: this.ruRol,
            ruUsu: this.ruUsu,
            ruEstado: this.ruEstado
        };

        return obj;
    }
}

module.exports = RolUsu;