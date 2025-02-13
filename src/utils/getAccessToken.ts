import axios from "axios";
import environmentConfig from "../config/environment.config";

const getAccessToken = async (): Promise<void> => {
  try {
    const data = new URLSearchParams();
    data.append("grant_type", "client_credentials");

    const authHeader = Buffer.from(
      `${environmentConfig.paypal.clientId}:${environmentConfig.paypal.clientSecret}`
    ).toString("base64");

    const response = await axios.post(
      `${environmentConfig.paypal.paypalBaseUrl}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const newAccessToken = response.data.access_token;
    return newAccessToken;
  } catch (error: any) {
    console.log("error", error.response.data);
    throw new Error((error as Error).message);
  }
};

export default getAccessToken;
