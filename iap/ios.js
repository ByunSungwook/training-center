const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { X509Certificate } = require('crypto');

async function decode(signedInfo) {

  // MARK: - Creating certs using Node's new build-in crypto
  function generateCertificate(cert) {
    // MARK: - A simple function just like the PHP's chunk_split, used in generating pem. 
    function chunk_split(body, chunklen, end) {
      chunklen = parseInt(chunklen, 10) || 76;
      end = end || '\n';
      if (chunklen < 1) { return false; }
      return body.match(new RegExp(".{0," + chunklen + "}", "g")).join(end);
    }
    return new X509Certificate(`-----BEGIN CERTIFICATE-----\n${chunk_split(cert, 64, '\n')}-----END CERTIFICATE-----`);
  }

  // MARK: - Removing the begin/end lines and all new lines/returns from pem file for comparison
  function getPemContent(path) {
    return fs.readFileSync(path)
      .toString()
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/[\n\r]+/g, '');
  }

  // MARK: - The signed info are in three parts as specified by Apple
  const parts = signedInfo.split('.');
  if (parts.length !== 3) {
    console.log('The data structure is wrong! Check it! ');
    return null;
  }
  // MARK: - All the information needed for verification is in the header
  const header = JSON.parse(Buffer.from(parts[0], "base64").toString());

  // MARK: - The chained certificates
  const certificates = header.x5c.map(cert => generateCertificate(cert));
  const chainLength = certificates.length;

  // MARK: - Leaf certificate is the last one
  const leafCert = header.x5c[chainLength - 1];
  // MARK: - Download .cer file at https://www.apple.com/certificateauthority/. Convert to pem file with this command line: openssl x509 -inform der -in AppleRootCA-G3.cer -out AppleRootCA-G3.pem
  const AppleRootCA = getPemContent(path.join(__dirname, '../../AppleRootCA-G3.pem'));
  // MARK: - The leaf cert should be the same as the Apple root cert
  const isLeafCertValid = AppleRootCA === leafCert;
  if (!isLeafCertValid) {
    console.log('Leaf cert not valid! ');
    return null;
  }

  // MARK: If there are more than one certificates in the chain, we need to verify them one by one 
  if (chainLength > 1) {
    for (var i = 0; i < chainLength - 1; i++) {
      const isCertValid = certificates[i].verify(certificates[i + 1].publicKey);
      if (!isCertValid) {
        console.log(`Cert ${i} not valid! `);
        return null;
      }
    }
  }

  return jwt.decode(signedInfo);
}

module.exports = decode;
