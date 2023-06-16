'use strict';

require('dotenv').config();

const { App } = require('@slack/bolt');
const quizData = require('./quizData.json'); // Import the quizData

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // enable the following to use socket mode
  appToken: process.env.SLACK_APP_TOKEN,
});

app.command('/hi', async ({ command, ack, say }) => {
  try {
    console.log('>>>>>', command);
    await ack();
    say('QuizBot is working!!!');
  } catch (error) {
    console.log('err');
    console.error(error);
  }
});

app.command('/quiz', async ({ command, ack, say }) => {
  try {
    console.log('>>>>>', command);
    await ack();

    const { topics } = quizData;
    const randomTopic = topics[Math.floor(Math.random() * topics.length)]; // Select a random topic
    const { questions } = randomTopic;
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]; // Select a random question
    const { question, choices } = randomQuestion;

    // Construct the question message with multiple-choice options
    let message = `Question: ${question}\n\n`;
    choices.forEach((choice) => {
      message += `${choice.option}. ${choice.text}\n`;
    });

    say(message);

  } catch (error) {
    console.log('err');
    console.error(error);
  }
});

(async () => {
  const port = process.env.PORT || 3002;
  // Start your app
  await app.start(port);
  console.log(`⚡️ Slack Bolt server is running on port ${port}!`);
})();
