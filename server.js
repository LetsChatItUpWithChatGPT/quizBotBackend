'use strict';

require('dotenv').config();

const { App } = require('@slack/bolt');
const axios = require('axios');

const classData = require('./quizData.json');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

async function generateQuizQuestion(topic) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: `Generate a quiz question for ${topic}`,
        max_tokens: 50,
        temperature: 0.8,
        n: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const question = response.data.choices[0].text.trim();
    return question;
  } catch (error) {
    console.error('Error generating quiz question:', error.message);
    return 'Sorry, an error occurred while generating the quiz question.';
  }
}

app.command('/quiz', async ({ command, ack, say }) => {
  try {
    await ack();

    const selectedTopic = command.text.toLowerCase();

    const classInfo = classData.find(
      (info) => info.topic.toLowerCase() === selectedTopic
    );

    if (classInfo) {
      const quizQuestion = await generateQuizQuestion(classInfo.topic);
      const message = `Here's a quiz question for ${classInfo.topic}: ${quizQuestion}`;
      await say(message);
    } else {
      const errorMessage = 'Sorry, I couldn\'t find any matching class for the selected topic.';
      await say(errorMessage);
    }
  } catch (error) {
    console.error('Error processing /quiz command:', error.message);
    await say('Sorry, an error occurred while processing your request.');
  }
});

(async () => {
  const port = process.env.PORT || 3002;
  await app.start(port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
