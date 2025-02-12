import { Request, Response } from "express";
import axios from "axios";
import log from "../../utils/logger";
import getAccessToken from "../../utils/getAccessToken";
import environmentConfig from "../../config/environment.config";

export const getPlanDetail = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken();
    const { planId } = req.params;

    if (!planId) {
      throw new Error("Plan ID is required");
    }

    const response = await axios.get(
      `${environmentConfig.paypal.paypalBaseUrl}/v1/billing/plans/${planId}`,
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
      message: "Plan details retrieved successfully",
      data: response.data,
    });
  } catch (error: any) {
    log.error(
      "Error fetching PayPal plan details:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch plan details",
      error: error.response?.data || error.message,
    });
  }
};
