import * as dotenv from "dotenv";
dotenv.config();

// INFO: this is for testing
// console.log(
//   `\n\n`+"process.env.PORT => "+process.env.PORT,
//   `\n\n`+"process.env.PAYPAL_MODE => "+process.env.PAYPAL_MODE,
//   `\n\n`+"process.env.PAYPAL_CLIENT_ID => "+process.env.PAYPAL_CLIENT_ID,
//   `\n\n`+"process.env.PAYPAL_CLIENT_SECRET => "+process.env.PAYPAL_CLIENT_SECRET,
//   `\n\n`+"process.env.PAYPAL_REDIRECT_BASE_URL => "+process.env.PAYPAL_REDIRECT_BASE_URL,
//   `\n\n`+"process.env.PAYPAL_BASE_URL => "+process.env.PAYPAL_BASE_URL,
//   `\n\n`+"process.env.DB_TYPE => "+process.env.DB_TYPE,
//   `\n\n`+"process.env.DB_URI => "+process.env.DB_URI,
//   `\n\n`+"process.env.DB_HOST => "+process.env.DB_HOST,
//   `\n\n`+"process.env.DB_NAME => "+process.env.DB_NAME,
//   `\n\n`+"process.env.DB_USER => "+process.env.DB_USER,
//   `\n\n`+"process.env.DB_PASSWORD => "+process.env.DB_PASSWORD,
//   `\n\n`+"process.env.NODE_ENV => "+process.env.NODE_ENV
// );

export default {
  app: {
    port: process.env.PORT,
  },
  paypal: {
    mode: process.env.PAYPAL_MODE,
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    redirectBaseUrl: process.env.PAYPAL_REDIRECT_BASE_URL,
    paypalBaseUrl: process.env.PAYPAL_BASE_URL,
    webhookId: process.env.PAYPAL_WEBHOOK_ID,
  },
  db: {
    type: process.env.DB_TYPE,
    url: process.env.DB_URI,
    host: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  email: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL,
    sendGridTemId: process.env.SENDGRID_TEM_ID,
  },
  environment: process.env.NODE_ENV || "local",
};
