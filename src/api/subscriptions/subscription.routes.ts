import express from "express";
import {
  createSubscription,
  approveSubscription,
} from "./subscription.controller";
import { handlePaypalWebhook } from "./subscription.webhook";

const subscriptionRoutes = express.Router();

subscriptionRoutes
  .post("/create", createSubscription)
  .post("/approve", approveSubscription)
  .post("/webhook", handlePaypalWebhook);

export default subscriptionRoutes;
