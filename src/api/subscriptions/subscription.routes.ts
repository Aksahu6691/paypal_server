import express from "express";
import {
  createSubscription,
  approveSubscription,
} from "./subscription.controller";

const subscriptionRoutes = express.Router();

subscriptionRoutes
  .post("/create", createSubscription)
  .post("/approve", approveSubscription);

export default subscriptionRoutes;
