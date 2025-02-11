import axios from "axios";
import environmentConfig from "../config/environment.config";

const getAccessToken = async (): Promise<void> => {
  try {
    const response = await axios.post(
      `${environmentConfig.paypal.paypalBaseUrl}/v1/oauth2/token`,
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        auth: {
          username: environmentConfig.paypal.clientId ?? "",
          password: environmentConfig.paypal.clientSecret ?? "",
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const newAccessToken = response.data.access_token;
    return newAccessToken;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export default getAccessToken;
