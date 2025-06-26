const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.GOOGLE_IOS_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: [GOOGLE_CLIENT_ID, GOOGLE_IOS_CLIENT_ID]
  });
  const payload = ticket.getPayload();
  return payload;
};


module.exports = { verifyGoogleToken };