class DenReview{
    constructor(){
        this.drId = "";
        this.drDen = "";
        this.drFunc = "";
        this.drComentario = "";
        this.drEstado = "";
    }

    toFirestore(){
        var obj = {
            drDen: this.drDen,
            drFunc: this.drFunc,
            drComentario: this.drComentario,
            drEstado: this.drEstado
        };
        return obj;
    }

    fromFirestore(data){
        this.drDen = data.drDen; 
        this.drFunc = data.drFunc; 
        this.drComentario = data.drComentario; 
        this.drEstado = data.drEstado; 
    }

    fromWebCambio(data){
        this.drDen = data.drDen;
        this.drFunc = data.drFunc;
        this.drComentario = data.drComentario;
    }
}

module.exports = DenReview;