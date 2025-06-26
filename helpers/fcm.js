const admin = require('./firebase-admin');

module.exports = {
  async sendMessage(deviceToken, data) {
    const message = {
      token: deviceToken,
      data: {
        data: JSON.stringify(data)
      },
      android: {
        priority: 'high',
        ttl: 1000 * 120
      }
    };
    return new Promise((resolve, reject) => {
      admin.messaging().send(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
          resolve(response);
        })
        .catch((error) => {
          console.error('Error sending message:', error);
          reject(error);
        });
    });
  }
}