import express from "express";
import { capturePayment, createOrder } from "./checkout.controller";

const checkoutRoutes = express.Router();

checkoutRoutes
  .post("/create-order", createOrder)
  .get("/capture-payment/:orderId", capturePayment);

export default checkoutRoutes;
