import axios from "axios";
import environmentConfig from "../config/environment.config";

const AxiosService = axios.create({
  baseURL: environmentConfig.paypal.paypalBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default AxiosService;
