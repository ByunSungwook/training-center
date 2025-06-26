const EventEmitter = require('node:events');
EventEmitter.defaultMaxListeners = 30;
const path = require('node:path');
const util = require('node:util');
const { v4: uuidv4 } = require('uuid');
const apn = require('apn');
const { APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_APNS_TOPIC } = process.env;

const option = {
  token: {
    keyId: APPLE_KEY_ID,
    key: path.join(__dirname, `../AuthKey_${APPLE_KEY_ID}.p8`),
    teamId: APPLE_TEAM_ID,
  },
  production: true
};

const deviceToken = 'device_token_here'; // Replace with actual device token

module.exports = {
  async sendMessage(token, data, isTestEnvironment) {
    if (isTestEnvironment === true) {
      option.production = false;
    }
    console.log(option);
    const apnProvider = new apn.Provider(option);
    const note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 1;
    note.sound = 'ping.aiff';
    note.alert = 'Hello, world!';
    note.payload = {
      "aps": {
        "alert": "VoIP Comming"
      },
      "handle": `${data.history._id}`,
      "callUUID": uuidv4(),
    };
    note.rawPayload = { history: data };
    note.topic = APPLE_APNS_TOPIC;

    return new Promise((resolve, reject) => {
      apnProvider.send(note, token)
        .then((response) => {
          console.log('Successfully sent message:', util.inspect(response, false, null, true));
          resolve(response);
        })
        .catch((error) => {
          console.error('Error sending message:', util.inspect(error, false, null, true));
          reject(error);
        })
        .finally(() => {
          apnProvider.shutdown();
        });
    });
  }
}