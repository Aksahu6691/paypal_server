import { Request, Response } from "express";
import log from "../../utils/logger";
import getAccessToken from "../../utils/getAccessToken";
import AxiosService from "../../utils/AxiosService";

export const getPlanDetail = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken();
    const { planId } = req.params;

    if (!planId) {
      throw new Error("Plan ID is required");
    }

    const response = await AxiosService.get(`/v1/billing/plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

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
