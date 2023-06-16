'use strict';

require('dotenv').config();

const { App } = require('@slack/bolt');
require('dotenv').config();

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode:true, // enable the following to use socket mode
  appToken: process.env.SLACK_APP_TOKEN,
});

(async () => {
  const port = process.env.PORT || 3002;
  // Start your app
  await app.start(port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();

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
