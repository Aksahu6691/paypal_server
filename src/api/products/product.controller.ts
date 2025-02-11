import { Request, Response } from "express";
import axios from "axios";
import log from "../../utils/logger";
import getAccessToken from "../../utils/getAccessToken";
import environmentConfig from "../../config/environment.config";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken();

    let image_url = "";
    if (req.file) {
      image_url = `images/${req.file.filename}`;
    } else {
      throw new Error("Image is required");
    }

    const productData = {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type || "SERVICE",
      category: req.body.category || "SOFTWARE",
      image_url: image_url,
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

    const response = await axios.post(
      `${environmentConfig.paypal.paypalBaseUrl}/v1/catalogs/products`,
      productData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "PayPal-Request-Id": `PRODUCT-${Date.now()}`, // Unique request ID
          Prefer: "return=representation",
        },
      }
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: response.data,
    });
  } catch (error: any) {
    log.error(
      "Error creating PayPal product:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.response?.data || error.message,
    });
  }
};
