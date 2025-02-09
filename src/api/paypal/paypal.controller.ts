import { Request, Response } from "express";
import log from "../../utils/logger";
import axios from "axios";
import environmentConfig from "../../config/environment.config";

const getAccessToken = async (): Promise<void> => {
  try {
    const response = await axios.post(
      `${environmentConfig.paypal.paypalBaseUrl}/v1/oauth2/token`,
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        auth: {
          username: environmentConfig.paypal.clientId ?? "",
          password: environmentConfig.paypal.clientSecret ?? "",
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const newAccessToken = response.data.access_token;
    return newAccessToken;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${environmentConfig.paypal.paypalBaseUrl}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            items: [
              {
                name: "Volatility Grid",
                description:
                  "Interactive Volatility dashboard for cryptocurrencies",
                quantity: "1",
                unit_amount: {
                  currency_code: "USD",
                  value: "50.00",
                },
              },
            ],
          },
        ],
        amount: {
          currency_code: "USD",
          value: "50.00",
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: "50.00",
            },
          },
        },
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
              payment_method_selected: "PAYPAL",
              brand_name: "DekayHub - Volatility Grid",
              locale: "en-US",
              user_action: "PAY_NOW",
              return_url: `${environmentConfig.paypal.redirectBaseUrl}/complete-payment`,
              cancel_url: `${environmentConfig.paypal.redirectBaseUrl}/cancel-payment`,
            },
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("response.data", response.data);
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
      `${environmentConfig.paypal.paypalBaseUrl}/v2/checkout/orders/${req.body.orderId}/capture`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("response.data", response.data);

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
