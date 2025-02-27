import { Request, Response } from "express";
import log from "../../utils/logger";
import getAccessToken from "../../utils/getAccessToken";
import environmentConfig from "../../config/environment.config";
import AxiosService from "../../utils/AxiosService";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import { AppDataSource } from "../../config/database.config";
import { Subscriptions } from "./subscription.model";

const subscriptionRepository = AppDataSource.getRepository(Subscriptions);

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
      subscriptionID: response.data.id,
      plan_id: subscriptionData.plan_id,
      status: response.data.status,
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

    // Validate subscription status
    if (response.data?.status !== "ACTIVE") {
      throw new Error("Subscription is not active");
    }

    // Prepare subscription data
    const newSubscription = new Subscriptions();
    newSubscription.user_id = req.body.user_id;
    newSubscription.plan_id = response.data.plan_id;
    newSubscription.subscription_id = response.data.id;
    newSubscription.status = response.data.status;
    newSubscription.start_time = response.data.start_time;
    newSubscription.next_billing_time =
      response.data.billing_info.next_billing_time;
    newSubscription.last_payment_date =
      response.data.billing_info.last_payment?.time || null;
    newSubscription.last_payment_status =
      response.data.billing_info.failed_payments_count > 0
        ? "FAILED"
        : "SUCCESS";
    newSubscription.failure_reason = null; // No failure reason for an active subscription
    newSubscription.cancellation_date = null; // No cancellation date for an active subscription

    await subscriptionRepository.save(newSubscription);

    successResponse(res, "Subscription verified successfully", {
      subscriptionID: response.data.id,
      status: response.data.status,
      start_time: response.data.start_time,
      next_billing_time: response.data.billing_info.next_billing_time,
    });
  } catch (error: any) {
    log.error(
      "Error verifying PayPal subscription:",
      error.response?.data || error.message
    );
    errorResponse(res, error);
  }
};
