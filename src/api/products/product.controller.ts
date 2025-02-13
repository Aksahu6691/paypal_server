import { Request, Response } from "express";
import log from "../../utils/logger";
import getAccessToken from "../../utils/getAccessToken";
import environmentConfig from "../../config/environment.config";
import AxiosService from "../../utils/AxiosService";
import { errorResponse, successResponse } from "../../utils/apiResponse";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken();

    if (!req.file) {
      throw new Error("Image is required");
    }

    const productData = {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type || "SERVICE",
      category: req.body.category || "SOFTWARE",
      image_url: `images/${req.file.filename}`,
      home_url: req.body.home_url || environmentConfig.paypal.redirectBaseUrl,
    };

    if (
      !productData.name ||
      !productData.description ||
      !productData.type ||
      !productData.category ||
      !productData.image_url ||
      !productData.home_url
    ) {
      throw new Error("All product fields are required");
    }

    const response = await AxiosService.post(
      "/v1/catalogs/products",
      productData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-Id": `PRODUCT-${Date.now()}`, // Unique request ID
          Prefer: "return=representation",
        },
      }
    );

    successResponse(res, "Product created successfully", response.data, 201);
  } catch (error: any) {
    log.error(
      "Error creating PayPal product:",
      error.response?.data || error.message
    );
    errorResponse(res, error);
  }
};
