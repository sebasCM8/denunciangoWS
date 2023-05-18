const { Schema, model } = require("mongoose");

const ImageSchema = new Schema(
  {
    imageData: {// Campo para almacenar el objeto binario de la imagen
      type: Buffer,
      required: true,
      unique: false,
    },
    nombre: {
      type: String,
      required: true,
      unique: false,
    },
    paterno: {
      type: String,
      required: true,
      unique: false,
    },
    materno: {
      type: String,
      required: true,
      unique: false,
    },
    ci: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);


ImageSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model("Image", ImageSchema);
