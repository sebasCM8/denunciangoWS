class Parametro{
    constructor(id, valor){
        this.parId = id;
        this.parValor = valor;
    }
}

module.exports = Parametro;

/*
{parId: "LoginIntentos", parValor: 3}
{parId: "LoginTiempoBloqueo", parValor: 10} //Minutos
{parId: "TiempoPassword", parValor: 15} //Dias
*/