const AWS = require('aws-sdk');
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION, // por ejemplo, 'us-east-1'
});

AWS.config.getCredentials(function(err) {
  if(err) console.log("Error de credenciales, no se puede conectar a AWS");
  else{
    console.log("Credenciales correctas, conectado a AWS");
  }
})

const rekognition = new AWS.Rekognition();


// const { rekognition } = require("../controllers/awsCtrl");

// imageSegip: la imagen del segip de tipo String, base64
// imageApp: la imagen enviada desde la app movil de tipo String, base64
function compareFaces(imageSegip, imageApp) {
  // const sourceImageBase64 = imageSegip.toString("base64");
  // const targetImageBase64 = imageApp.toString("base64");
  // const sourceImageBase64 = imageSegip;
  // const targetImageBase64 = imageApp;

  const params = {
    SourceImage: {
      Bytes: Buffer.from(imageSegip, "base64"),
    },
    TargetImage: {
      Bytes: Buffer.from(imageApp, "base64"),
    },
  };
  return new Promise((resolve, reject) => {
    rekognition.compareFaces(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        const faceMatches = data.FaceMatches;
        if (faceMatches.length === 0) {
          resolve(0);
        } else {
          const similarity = faceMatches[0].Similarity;
          resolve(similarity);
        }
      }
    });
  });
}

module.exports = compareFaces;
