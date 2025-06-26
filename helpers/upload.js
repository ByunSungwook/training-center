const s3 = require('./s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('node:crypto');

//TODO: multer 패키지 안쓰고 파일 업로드하는 방법 찾기 (한글명 파일 업로드시 글자 깨짐)

const upload = multer({
  limits: { fileSize: 500 * 1024 * 1024 },
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    cacheControl: 'max-age=31536000',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, crypto.randomBytes(48).toString('hex'));
    }
  })
})

module.exports = upload;