const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const OPENAI_API_KEY = process.env.API_KEY;
const CHAT_MODEL = 'gpt-3.5-turbo';
const IMAGE_MODEL = 'DALL-E'
const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';

async function invokeAIWebRequest(messages, model) {
  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  };

  if (model == CHAT_MODEL) {
    const endpoint = `${OPENAI_API_BASE_URL}/chat/completions`
    const body = {
    model: model,
    messages: messages,
    max_tokens: 1000,
    temperature: 1,
    n: 1,
  }
} else if (model == IMAGE_MODEL) {
  const endpoint = `${OPENAI_API_BASE_URL}/images/generations`
  const body = {
    prompt: messages,
    n: 1,
    size: '256x256'

  }
};

  const response = await axios.post(endpoint, body, { headers: headers });
  return response.data;
}


// Updated /init route
app.post('/init', async (req, res) => {
  const botName = req.body.botName;
  const instruction = `You are required to build a prompt for ChatGPT to follow that will instruct it to behave in a context that makes sense for the name its been given.
For example if the name is snarkbot you want to instruction prompt to specify that the AI should be as snarky as possible. If the name indicates that the bot should be a writer then the prompt should tell it to be as eloquent and story telling as possible in its replies.
You want to ensure that the instructions include assuming the role in its entireity, and using role play adopting the character completely. If the name indicates "Bot" then the instructions should allow for the persona to be an AI Model of the role.

Example 1
Name: Snarkbot
Reply: You are Snarkbot, a witty and sarcastic AI. Your goal is to respond to questions and comments with the utmost snarkiness and sarcasm. Don't hold back, let your wit shine through in every response!

Example 2
Name: Albus Dumbledore
Reply: You are Albus Dumbledore, a wise and powerful wizard. You are the headmaster of Hogwarts and your goal is to offer guidance and inspiration to those who seek your advice and enlightenment to all through education. Speak in a calm and measured tone, and offer your insight with depth and cryptic statements. As a great wizard and mentor, your words carry weight and should be chosen carefully.

Name: ${botName}
`;

  const initialSystemMessage = {
    role: 'system',
    content: 'We are in a role-playing game. Adopt the persona with 100% commitment. Provide an immersive experience in your interactions for the context provided in the role.',
  };

  const aiBotInitPrompt = {
    role: 'user',
    content: instruction
  };



  const initReply = await invokeAIWebRequest([aiBotInitPrompt], CHAT_MODEL);
  const initialUserMessage = {
    "role": initReply.choices[0].message.role,
    "content": initReply.choices[0].message.content.replace('Reply: ', 'Persona: ')
   }

  const profileGenerationPrompt = `Using the following persona description, create a profile picture that depicts the person.
  ${initialUserMessage.content}
`;

  const profilePicReply = await invokeAIWebRequest(profileGenerationPrompt, IMAGE_MODEL)
  const imgUrl = profilePicReply.data[0].url
  
  const initialMessages = {"chat": [initialSystemMessage, initialUserMessage], "img": imgUrl };

  try {
    res.json({ initialMessages });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while initializing the chatbot.');
  }
});

// Updated /chat route
app.post('/chat', async (req, res) => {
  const messages = req.body.chatMessages;

  try {
    const aiResponse = await invokeAIWebRequest(messages, CHAT_MODEL);
    const botMessage = aiResponse.choices[0].message;
    res.json({ botMessage });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing the chat message.');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
