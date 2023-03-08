const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const jwt = require("jsonwebtoken");

const client = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const createSendEmailCommand = (
  toAddress,
  fromAddress,
  securityCode,
  token
) => {
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
          Data: `<p>Your otp for generating new account is ${securityCode}</P><br />
          <p>Please click below link to register yourself</p>
          <a href="${process.env.FRONTEND_URL}/register/${token}" style="color:blue;text-decoration:underline">Click to Register<a/>
          `,
        },
        Text: {
          Charset: "UTF-8",
          Data: `Your otp for generating new account is ${securityCode} `,
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
  const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY);
  const sendEmailCommand = createSendEmailCommand(
    email,
    process.env.SOURCE_MAIL,
    securityCode,
    token
  );

  try {
    return await client.send(sendEmailCommand);
  } catch (e) {
    console.error("Failed to send email.", e);
    return e;
  }
};
