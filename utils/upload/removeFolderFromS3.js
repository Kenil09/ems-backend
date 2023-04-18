const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  /* configuration options */ region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

async function deleteS3Folder(bucketName, folderName) {
  const listParams = {
    Bucket: bucketName,
    Prefix: folderName,
  };

  const objects = await s3Client.send(new ListObjectsV2Command(listParams));
  if (objects.KeyCount === 0) {
    return;
  }
  if (objects.Contents.length === 0) {
    return;
  }

  const deleteParams = {
    Bucket: bucketName,
    Delete: { Objects: [] },
  };

  objects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3Client.send(new DeleteObjectsCommand(deleteParams));

  if (objects.IsTruncated) {
    await deleteS3Folder(bucketName, folderName);
  } else {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: folderName,
      })
    );
  }
}

module.exports = deleteS3Folder;
