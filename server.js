const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');


dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.post('/chat', async (req, res) => {
    const { userName, botName, message } = req.body;
    const apiKey = process.env.API_KEY;
    const openAIModel = 'gpt-3.5-turbo';
    const openAIBaseURL = 'https://api.openai.com/v1';

    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };

    async function invokeAIWebRequest(messages) {
        const openAIBody = {
            model: openAIModel,
            messages,
            max_tokens: 1000,
            temperature: 1,
            n: 1,
        };

        const response = await axios.post(`${openAIBaseURL}/chat/completions`, openAIBody, { headers });
        return response.data;
    }

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

    const aiInstruction = await invokeAIWebRequest([{ role: 'user', content: instruction }]);
    const aiPrompt = aiInstruction.choices[0].message.content;

    const chatMessages = [
        {
            role: 'system',
            content: 'We are in a role playing game. Adopt the persona with 100% commitment. Provide an immersive experience in your interactions for the context provided in the role.',
        },
        {
            role: 'user',
            content: aiPrompt.replace('Reply: ', ''),
        },
    ];

    const aiWebRequest = await invokeAIWebRequest([...chatMessages, { role: 'user', content: message }]);
    const aiReply = aiWebRequest.choices[0].message.content;
    
    res.json({ aiReply });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
