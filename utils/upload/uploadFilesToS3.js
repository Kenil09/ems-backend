const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

module.exports = async (files, bucketName, folder) => {
  const uploadPromises = files.map(async (file) => {
    const params = {
      Bucket: bucketName,
      Key: `${folder}/${file.originalname}`,
      Body: file.buffer,
    };
    const command = new PutObjectCommand(params);
    const response = await client.send(command);
    return response;
  });
  return Promise.all(uploadPromises);
};
