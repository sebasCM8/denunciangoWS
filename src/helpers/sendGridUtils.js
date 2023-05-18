const GenericOps = require("./genericops");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendEmail(email) {
  var randomCode = GenericOps.generateVerificationCode(); //aqui genera el codigo de verificacion
  // console.log(randomCode);

  const data = {
    code: randomCode, //aqui envia el codigo en un json para la plantilla de sendgrid
  };

  const msg = {
    to: email, // Change to your recipient
    from: {
      name: "denunciango",
      email: "nitaappihc@gmail.com",
    },
    template_id: "d-ce45e1ea008a42d7beef01eb3d5321b3",
    subject: "Codigo de verificacion",
    dynamicTemplateData: data,
  };
  return new Promise((resolve, reject) => {
    sgMail
      .send(msg)
      .then(() => {
        resolve(randomCode); // Resuelve la promesa sin un valor
      })
      .catch((error) => {
        reject(error); // Rechaza la promesa con el error
      });
  });
}

module.exports = sendEmail;
