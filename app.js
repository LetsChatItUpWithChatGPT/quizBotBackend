'use strict';


// bring in the OpenAI API
require('dotenv').config();
const { App } = require('@slack/bolt');
const { Configuration, OpenAIApi } = require('openai');

const userConversations = new Map();

// create a new instance of the OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openAI = new OpenAIApi(configuration);


// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

//!! PROOF OF LIFE MESSAGE
app.message('hello', async ({ message, say }) => {
  // Respond with "Hello, world!"
  await say('Hello, world!');
});

const chatModule = (app) => {
  app.event('message', async ({ event, ack, say }) => {

    // userConversations = new Map(); // moved inside function for exporting?
    const channelId = event.channel;

    let conversationHistory = userConversations.get(channelId) || [{ role: 'system', content: 'Provide basic response to questions without code unless requested by user.' }];

    if (event.channel_type === 'im') {
      console.log(event.text);
      console.log('event>>>>>', event);


      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const openAI = new OpenAIApi(configuration);

      conversationHistory.push({ role: 'user', content: event.text });

      // Modify user message to then allow the ai to respond with just the steps and not the code
      const userMessage = event.text;
      const modifiedUserMessage = `Steps to solve this problem domain: ${userMessage}`;
      conversationHistory.push({ role: 'user', content: modifiedUserMessage });

      say({
        text: ':robot_face: AI is formulating a response...',
      });


      const response = await openAI.createChatCompletion({
        model: 'gpt-3.5-turbo', // text-davinci-003
        temperature: 0.8,
        messages: conversationHistory,
        // stream: true,
        // max_tokens: 150,
        // stop: ['###', 'user', 'assistant'],
      });


      console.log('conversationHistory>>>>>', conversationHistory);

      const aiResponse = response.data.choices[0].message.content;

      conversationHistory.push({ role: 'assistant', content: aiResponse });

      userConversations.set(channelId, conversationHistory);

      console.log(response.data.choices);
      say({
        text: aiResponse,
      });


      if (conversationHistory.length > 0) {
        // Check if the user's message is a follow-up question...
        const isFollowUpQuestion = userMessage.includes('Further explanation');
        if (isFollowUpQuestion) {
          const followUpQuestion = userMessage.substring(userMessage.indexOf(':') + 1).trim();
          conversationHistory.push({ role: 'user', content: followUpQuestion });

          // Repeat the AI response generation with the follow-up question included
          const followUpResponse = await openAI.createChatCompletion({
            model: 'gpt-3.5-turbo',
            temperature: 0.8,
            messages: conversationHistory,
          });

          const aiFollowUpResponse = followUpResponse.data.choices[0].message.content;
          conversationHistory.push({ role: 'assistant', content: aiFollowUpResponse });

          // Repeat
          userConversations.set(channelId, conversationHistory);

          console.log(followUpResponse.data.choices);
          say({
            text: aiFollowUpResponse,
          });
        }
      }
    }
  });
};



(async () => {
  const port = process.env.PORT || 3002;
  // Start your app
  await app.start(port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();

module.exports = chatModule;
