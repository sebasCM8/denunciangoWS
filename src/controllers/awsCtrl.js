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

module.exports = { rekognition }








