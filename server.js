'use strict';

require('dotenv').config();
const { App } = require('@slack/bolt');
const { Configuration, OpenAIApi } = require('openai');

const userConversations = new Map();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openAI = new OpenAIApi(configuration);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// !! PROOF OF LIFE MESSAGE
app.message('hello', async ({ message, say }) => {
  await say('Hello, world!');
});

const chatModule = (app) => {
  app.event('message', async ({ event, ack, say }) => {
    // Check if the message is from the QuizBot channel
    if (event.channel === 'U05CJQQ05PC') { // Replace 'C12345678' with the actual ID of the QuizBot channel
      const channelId = event.channel;

      let conversationHistory = userConversations.get(channelId) || [
        { role: 'system', content: 'Provide basic response to questions without code unless requested by user.' },
      ];

      if (event.channel_type === 'im') {
        console.log(event.text);
        console.log('event>>>>>', event);

        conversationHistory.push({ role: 'user', content: event.text });

        const userMessage = event.text;
        const modifiedUserMessage = `Steps to solve this problem domain: ${userMessage}`;
        conversationHistory.push({ role: 'user', content: modifiedUserMessage });

        say({
          text: ':robot_face: AI is formulating a response...',
        });

        const response = await openAI.createChatCompletion({
          model: 'gpt-3.5-turbo',
          temperature: 0.8,
          messages: conversationHistory,
          stream: true,
          max_tokens: 150,
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
          const isFollowUpQuestion = userMessage.includes('Further explanation');
          if (isFollowUpQuestion) {
            const followUpQuestion = userMessage.substring(userMessage.indexOf(':') + 1).trim();
            conversationHistory.push({ role: 'user', content: followUpQuestion });

            const followUpResponse = await openAI.createChatCompletion({
              model: 'gpt-3.5-turbo',
              temperature: 0.8,
              messages: conversationHistory,
            });

            const aiFollowUpResponse = followUpResponse.data.choices[0].message.content;
            conversationHistory.push({ role: 'assistant', content: aiFollowUpResponse });

            userConversations.set(channelId, conversationHistory);

            console.log(followUpResponse.data.choices);
            say({
              text: aiFollowUpResponse,
            });
          }
        }
      }
    }
  });
};

chatModule(app);

(async () => {
  const port = process.env.PORT || 3002;
  await app.start(port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();

module.exports = chatModule;