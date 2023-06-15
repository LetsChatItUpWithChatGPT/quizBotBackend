'use strict';

require('dotenv').config();
const { App, LogLevel } = require('@slack/bolt');
const { Configuration, OpenAIApi } = require('openai');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openAI = new OpenAIApi(configuration);

const quizData = require('./quizData.json');

app.command('/quiz', async ({ command, ack, respond }) => {
  await ack();

  const searchTerm = command.text.trim().toLowerCase();

  const matchingQuestions = quizData.filter(
    (entry) =>
      entry.class.toLowerCase().includes(searchTerm) ||
      entry.topic.toLowerCase().includes(searchTerm)
  );

  if (matchingQuestions.length === 0) {
    await respond(`No quiz questions found for "${searchTerm}". Please try a different search term.`);
    return;
  }

  const selectedQuestion = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
  const { class: quizClass, topic, challenge } = selectedQuestion;

  const prompt = `Quiz question for ${quizClass} - ${topic}\n\nChallenge: ${challenge}\n\n`;

  try {
    const response = await openAI.complete({
      engine: 'text-davinci-003',
      prompt,
      maxTokens: 100,
      n: 1,
      stop: '\n',
    });

    const quizQuestion = response.choices[0].text.trim();

    await respond({
      text: `Here's a quiz question for ${quizClass} - ${topic}:\n\n${quizQuestion}`,
      response_type: 'in_channel',
    });
  } catch (error) {
    console.error('Error generating quiz question:', error);
    await respond('An error occurred while generating the quiz question. Please try again later.');
  }
});

(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
