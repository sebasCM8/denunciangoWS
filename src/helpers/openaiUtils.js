const { Configuration, OpenAIApi } = require("openai");

async function tieneContenidoOfensivo(texto) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const mensaje = '"' + texto + '"';
  const promt =
    "¿el siguiente texto tiene lenguaje ofensivo, odio, acoso o violencia? Si contiene la respuesta sera true, si no contiene false, solo quiero una palabra como respuesta. " +
    mensaje;

  //   try {
  const apiRequestBody = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: promt }],
    temperature: 0.6,
  };
  const completion = await openai.createChatCompletion(apiRequestBody);
  const completionResp = completion.data.choices[0].message.content;
  const cadena = completionResp.toLowerCase(); // A minusculas
  const sinEspacios = cadena.replace(/\s/g, ""); // Quitar los espacios
  const sinPuntos = sinEspacios.replace(/\./g, ""); // Quitar los puntos

  const esOfensivo = sinPuntos === "true";
  return esOfensivo;
  
}

module.exports = tieneContenidoOfensivo;
