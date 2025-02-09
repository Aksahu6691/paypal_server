import express from "express";
import { capturePayment, createOrder } from "./paypal.controller";

const paypalRoutes = express.Router();

paypalRoutes
  .post("/create-order", createOrder)
  .get("/capture-payment/:orderId", capturePayment);

export default paypalRoutes;
