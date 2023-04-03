const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

module.exports = async (file, bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
  };
  const command = new PutObjectCommand(params);
  const response = await client.send(command);
  return response;
};
