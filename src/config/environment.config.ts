import * as dotenv from "dotenv";
dotenv.config();

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
  },
};
