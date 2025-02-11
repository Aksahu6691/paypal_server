import { Request, Response } from "express";
import axios from "axios";
import log from "../../utils/logger";
import getAccessToken from "../../utils/getAccessToken";
import environmentConfig from "../../config/environment.config";

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken(); // Get PayPal access token

    const subscriptionData = {
      plan_id: req.body.plan_id,
      start_time: req.body.start_time || new Date().toISOString(),
      quantity: req.body.quantity || "1",
      shipping_amount: {
        currency_code: "USD",
        value: "10.00",
      },
      subscriber: {
        name: {
          given_name: "John",
          surname: "Doe",
        },
        email_address: "customer@example.com",
        shipping_address: {
          name: {
            full_name: "John Doe",
          },
          address: {
            address_line_1: "2211 N First Street",
            address_line_2: "Building 17",
            admin_area_2: "San Jose",
            admin_area_1: "CA",
            postal_code: "95131",
            country_code: "US",
          },
        },
      },
      application_context: {
        brand_name: "walmart",
        locale: "en-US",
        shipping_preference: "SET_PROVIDED_ADDRESS",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: `${environmentConfig.paypal.redirectBaseUrl}/success`,
        cancel_url: `${environmentConfig.paypal.redirectBaseUrl}/cancel`,
      },
    };

    if (!subscriptionData.plan_id) {
      throw new Error("Plan ID is required");
    }

    const response = await axios.post(
      `${environmentConfig.paypal.paypalBaseUrl}/v1/billing/subscriptions`,
      subscriptionData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "PayPal-Request-Id": `SUBSCRIPTION-${Date.now()}`, // Unique request ID
          Prefer: "return=representation",
        },
      }
    );

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: response.data,
    });
  } catch (error: any) {
    log.error(
      "Error creating PayPal subscription:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: error.response?.data || error.message,
    });
  }
};

export const getSubscriptionDetails = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken();
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      throw new Error("Subscription ID is required");
    }

    const response = await axios.get(
      `${environmentConfig.paypal.paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Subscription details retrieved successfully",
      data: response.data,
    });
  } catch (error: any) {
    log.error(
      "Error fetching PayPal subscription details:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription details",
      error: error.response?.data || error.message,
    });
  }
};
