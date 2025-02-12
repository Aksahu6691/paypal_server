import { Request, Response } from "express";
import log from "../../utils/logger";
import axios from "axios";
import environmentConfig from "../../config/environment.config";
import getAccessToken from "../../utils/getAccessToken";
import AxiosService from "../../utils/AxiosService";

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accessToken = await getAccessToken();

    const { price, currency } = req.body;

    const requestBody = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: "d9f80740-38f0-11e8-b467-0ed5f89f718b",
          amount: {
            currency_code: currency,
            value: `${price}`,
          },
        },
      ],
      payment_source: {
        paypal: {
          address: {
            address_line_1: "2211 N First Street",
            address_line_2: "17.3.160",
            admin_area_1: "CA",
            admin_area_2: "San Jose",
            postal_code: "95131",
            country_code: "US",
          },
          email_address: "payer@example.com",
          payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
          experience_context: {
            return_url: `${environmentConfig.paypal.redirectBaseUrl}/app/complete-payment`,
            cancel_url: `${environmentConfig.paypal.redirectBaseUrl}/app/cancel-payment`,
          },
        },
      },
    };

    const response = await AxiosService.post(
      "/v2/checkout/orders",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const orderId = response.data.id;

    res.status(200).json({ orderId });
  } catch (error) {
    log.error("Error:", (error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const capturePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `/v2/checkout/orders/${req.params.orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("capture_payment_response:", response.data);

    if (response.data.status !== "COMPLETED") {
      res.status(400).json({ error: "PayPal payment incomplete or failed" });
    }

    const email = "eJg9x@example.com";
    const daysToExtend = 30;
    const currentDate = new Date();
    const tierEndAt = new Date(
      currentDate.setDate(currentDate.getDate() + daysToExtend)
    );

    res.status(200).json({
      message: "Payment captured successfully",
      email,
      tier: "pro",
      tierEndAt,
    });
  } catch (error) {
    log.error("Error:", (error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
};
