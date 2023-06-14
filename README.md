# quizBotBackend

### Documentation

1. Set up a new Slack app:
   - Go to the Slack API website (https://api.slack.com/apps) and create a new app.
   - Add the necessary scopes and permissions to your app. In this case, you'll need the `chat:write` scope to allow the bot to send messages.
   - Install the app to your workspace.

2. Set up OpenAI 
  - Go to View API Keys
  - Create new secret key

3. Create a new Node.js project:
   - Set up a new Node.js project and initialize it with `npm init -y`.
   - Install the `@slack/bolt` library by running `npm install @slack/bolt`.

4. Write the code for the Slack bot:
   Create a file (e.g., `slackBot.js`) and add the following code:

```javascript
const { App } = require('@slack/bolt');
const { Configuration, OpenAIApi } = require('openai');

// OpenAI API configuration
const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY,});

const openai = new OpenAIApi(configuration);

// Slack App configuration
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 3000
});

app.message('hello', async ({ message, say }) => {
  // Respond with "Hello, world!"
  await say('Hello, world!');
});
(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);
  console.log('Bot is running!');
})();
```

5. Set up environment variables:
   - Obtain your Slack app's signing secret and bot token from the Slack API website.
   - Set the environment variables `SLACK_SIGNING_SECRET` and `SLACK_BOT_TOKEN` with the corresponding values.

6. Run the bot:
   Start the bot by running `node slackBot.js`.

7. Add the bot to your Slack workspace:
   - Go to the Slack API website and navigate to your app's settings.
   - Under "OAuth & Permissions", click on "Install to Workspace" to add the bot to your workspace.
