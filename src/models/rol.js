class Rol{

    static ADMINISTRADOR = 1;
    static FUNCIONARIO = 2;

    constructor(){
        this.rolId = ""; // 1-Administrador 2-Funcionario
        this.rolNombre = "";
    }
}

module.exports = Rol;