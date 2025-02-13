import { Request, Response } from "express";
import log from "../../utils/logger";
import getAccessToken from "../../utils/getAccessToken";
import environmentConfig from "../../config/environment.config";
import AxiosService from "../../utils/AxiosService";
import { errorResponse, successResponse } from "../../utils/apiResponse";

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken(); // Get PayPal access token

    const subscriptionData = {
      plan_id: req.body.plan_id,
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

    const response = await AxiosService.post(
      "/v1/billing/subscriptions",
      subscriptionData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-Id": `SUBSCRIPTION-${Date.now()}`, // Unique request ID
          Prefer: "return=minimal",
        },
      }
    );

    successResponse(res, "Subscription created successfully", {
      data: {
        id: response.data.id,
        plan_id: response.data.plan_id,
        status: response.data.status,
      },
    });
  } catch (error: any) {
    log.error(
      "Error creating PayPal subscription:",
      error.response?.data || error.message
    );
    errorResponse(res, error);
  }
};

export const approveSubscription = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken();
    const { orderID, subscriptionID } = req.body;

    if (!orderID || !subscriptionID) {
      throw new Error("Order ID and subscription ID are required");
    }

    const response = await AxiosService.get(
      `/v1/billing/subscriptions/${subscriptionID}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    successResponse(res, "Subscription details retrieved successfully", {
      data: response.data,
    });
  } catch (error: any) {
    log.error("Error validating PayPal subscription:", error);
    errorResponse(res, error);
  }
};
