const { rekognition } = require("../controllers/awsCtrl");

// imageSegip: la imagen del segip de tipo Buffer
// imageApp: la imagen enviada desde la app movil de tipo Buffer
function compareFaces(imageSegip, imageApp) {
  return new Promise((resolve, reject) => {
    const sourceImageBase64 = imageSegip.toString("base64");
    const targetImageBase64 = imageApp.toString("base64");

    const params = {
      SourceImage: {
        Bytes: Buffer.from(sourceImageBase64, "base64"),
      },
      TargetImage: {
        Bytes: Buffer.from(targetImageBase64, "base64"),
      },
    };

    rekognition.compareFaces(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        const faceMatches = data.FaceMatches;
        if (faceMatches.length === 0) {
          resolve(0);
        } else {
          resolve(faceMatches[0].Similarity);
        }
      }
    });
  });
}

module.exports = compareFaces;