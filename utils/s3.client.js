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
  putObject: async (name, { stream, meta, size }) => minioClient.putObject(bucket, name, stream, size, meta),
  get: async (name) => minioClient.presignedGetObject(bucket, name, 10 * 60),
  getStream: async (name) => minioClient.getObject(bucket, name, 10 * 60),
  delete: async (name) => minioClient.removeObject(bucket, name),
};
