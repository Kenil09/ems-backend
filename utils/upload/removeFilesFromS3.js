const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

module.exports = async (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  const command = new DeleteObjectCommand(params);
  const response = await client.send(command);
  return response;
};
