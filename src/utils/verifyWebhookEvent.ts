import crypto from "crypto";
import crc32 from "buffer-crc32";
import axios from "axios";
import environmentConfig from "../config/environment.config";

export const verifyWebhookSignature = async (
  headers: any,
  eventBody: any
): Promise<boolean> => {
  try {
    const transmissionId = headers["paypal-transmission-id"];
    const timeStamp = headers["paypal-transmission-time"];
    const webhookId = environmentConfig.paypal.webhookId;
    const signature = headers["paypal-transmission-sig"];
    const certUrl = headers["paypal-cert-url"];

    const crc = parseInt(
      crc32(Buffer.from(JSON.stringify(eventBody))).toString("hex"),
      16
    );

    if (!transmissionId || !timeStamp || !webhookId || !certUrl || !signature) {
      console.error("❌ Missing required headers for signature verification");
      return false;
    }

    // verify domain is actually paypal.com, or else someone
    const urlObj = new URL(certUrl);
    if (!urlObj.hostname.endsWith(".paypal.com")) {
      throw new Error(
        `URL ${certUrl} is not in the domain paypal.com, refusing to fetch cert for security reasons`
      );
    }

    // Construct message
    const message = `${transmissionId}|${timeStamp}|${webhookId}|${crc}`;

    // Fetch PayPal's public certificate
    const paypalCert = await getPaypalCertificate(certUrl);
    console.log("📜 PayPal certificate retrieved");

    // Ensure the certificate is in correct PEM format
    if (!paypalCert.includes("-----BEGIN CERTIFICATE-----")) {
      throw new Error("Invalid PayPal certificate format.");
    }

    // Create buffer from base64-encoded signature
    const signatureBuffer = Buffer.from(signature, "base64");

    // Create a verification object
    const verifier = crypto.createVerify("SHA256");

    // Add the original message to the verifier
    verifier.update(message, "utf8");
    verifier.end();

    // Verify the signature
    const isValid = verifier.verify(paypalCert, signatureBuffer);

    return isValid;
  } catch (error) {
    console.error("Error verifying PayPal webhook signature:", error);
    return false;
  }
};

// Function to fetch PayPal's public certificate
const getPaypalCertificate = async (certUrl: string): Promise<string> => {
  try {
    const response = await axios.get(certUrl);
    return response.data; // PayPal certificate in PEM format
  } catch (error: any) {
    console.error("Failed to fetch PayPal certificate:", error);
    throw new Error("Could not fetch PayPal certificate");
  }
};
