import express from "express";
import {
  createSubscription,
  getSubscriptionDetails,
} from "./subscription.controller";

const subscriptionRoutes = express.Router();

subscriptionRoutes
  .post("/create", createSubscription)
  .get("/get/:subscriptionId", getSubscriptionDetails);

export default subscriptionRoutes;
