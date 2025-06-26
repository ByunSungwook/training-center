const admin = require('firebase-admin');
const FIREBASE_ADMIN_SDK = process.env.FIREBASE_ADMIN_SDK
const serviceAccount = require(FIREBASE_ADMIN_SDK);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;