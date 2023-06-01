// const {
//   ChatCompletionRequestMessage,
//   CreateChatCompletionRequest
// } = require('openai');
const express = require('express');
const router = express.Router();

const openai = require('../../libs/openai');

router.post('/', async (req, res) => {
  const requestMessages = req.body.messages;

  try {
    // let tokenCount = 0;
    // requestMessages.forEach((msg) => {
    //   const tokens = getTokens(msg.content);
    //   tokenCount += tokens;
    // });

    const moderationResponse = await openai.createModeration({
      input: requestMessages[requestMessages.length - 1].content,
    });
    if (moderationResponse.data.results[0]?.flagged) {
      return res.status(400).send('El mensaje es inapropiado');
    }

    const prompt = 'Eres "Cappuccino", un asistente basado en IA que te ayuda a programar';

    // tokenCount += getTokens(prompt);
    // if (tokenCount > 4000) {
    //   return res.status(400).send("Message is too long");
    // }

    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }, ...requestMessages],
      temperature: 0.6,
    };
    const completion = await openai.createChatCompletion(apiRequestBody);

    res.json(completion.data);

  } catch (error) {
    if (error instanceof Error) {
      // @ts-ignore
      console.log(error);
    }
    res.status(500).send('Algo salió mal');
  }
});

module.exports = router;
