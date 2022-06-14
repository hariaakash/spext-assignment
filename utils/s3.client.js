const Minio = require('minio');

const endPoint = process.env.S3_URI || 'storage.googleapis.com';
const accessKey = process.env.S3_ACCESS_KEY;
const secretKey = process.env.S3_SECRET_KEY;
const region = process.env.S3_REGION;
const bucket = process.env.S3_BUCKET;

const minioClient = new Minio.Client({
  endPoint,
  useSSL: true,
  accessKey,
  secretKey,
  region,
});

module.exports = {
  bucket,
  client: minioClient,
  putObject: async (name, { stream, meta }) => minioClient.putObject(bucket, name, stream, null, meta),
};
