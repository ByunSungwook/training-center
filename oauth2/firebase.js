const admin = require('firebase-admin');
const path = require('node:path');
const accountPath = '../' + process.env.FIREBASE_ACCOUNT_PATH || 'firebase-admin-account.json';
const serviceAccount = require(`${accountPath}`);

const cert = admin.credential.applicationDefault({
  projectId: serviceAccount.project_id,
  clientEmail: serviceAccount.client_email,
  privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
})

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = {
  admin,
};