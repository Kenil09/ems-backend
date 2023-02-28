const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const client = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const createSendEmailCommand = (toAddress, fromAddress, securityCode) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      ToAddresses: [
        toAddress,
        /* more To-email addresses */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: `Your otp for generating new accoutn is ${securityCode}`,
        },
        Text: {
          Charset: "UTF-8",
          Data: `Your otp for generating new accoutn is ${securityCode}`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Verification mail",
      },
    },
    Source: fromAddress,
  });
};

module.exports = async (email, securityCode) => {
  const sendEmailCommand = createSendEmailCommand(
    email,
    process.env.SOURCE_MAIL,
    securityCode
  );

  try {
    return await client.send(sendEmailCommand);
  } catch (e) {
    console.error("Failed to send email.", e);
    return e;
  }
};
