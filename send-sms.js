const {client} = require('./db.js');
const {findReadyMessages, executeStep} = require('./smsService.js');

(async () => {
  const messages = await findReadyMessages()
  for (let message of messages) {
    await executeStep(message)
  }

  await client.close()
})();
