const jwt = require('jsonwebtoken');
const { JwksClient } = require('jwks-rsa');
const { admin } = require('./firebase');

const verifyAppleToken = async (token) => {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded) {
    throw new Error('Invalid token');
  }
  const keyIdFromToken = decoded.header.kid;
  const jwksClient = new JwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys',
  });
  const key = await jwksClient.getSigningKey(keyIdFromToken);
  const publicKey = key.getPublicKey();
  const verifiedDecodedToken = jwt.verify(token, publicKey, { algorithms: [decoded.header.alg] });

  return verifiedDecodedToken;
};

const verifyFirebaseToken = async (token) => {
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken;
};

module.exports = {
  verifyAppleToken,
  verifyFirebaseToken,
};