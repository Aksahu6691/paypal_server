import { Request, Response } from "express";
import crypto from "crypto";
import log from "../../utils/logger";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import { AppDataSource } from "../../config/database.config";
import { Subscriptions } from "./subscription.model";
import environmentConfig from "../../config/environment.config";
import sendEmail from "../../utils/sendCustomEmail";

const subscriptionRepository = AppDataSource.getRepository(Subscriptions);

export const handlePaypalWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;
    // const webhookId = environmentConfig.paypal.webhookId; // Your PayPal webhook ID
    // const paypalCertUrl = req.headers['paypal-cert-url'] as string;
    // const transmissionId = req.headers['paypal-transmission-id'] as string;
    // const timestamp = req.headers['paypal-transmission-time'] as string;
    // const signature = req.headers['paypal-transmission-sig'] as string;

    // Verify the webhook signature
    // const verified = verifyWebhookSignature(webhookId, event, paypalCertUrl, transmissionId, timestamp, signature);
    // if (!verified) {
    //   throw new Error("Webhook signature verification failed");
    // }

    log.info(`Received PayPal webhook event: ${event.event_type}`);

    // Handle different webhook events
    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(event);
        break;
      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancelled(event);
        break;
      case "BILLING.SUBSCRIPTION.CREATED":
        await handleSubscriptionCreated(event);
        break;
      case "BILLING.SUBSCRIPTION.EXPIRED":
        await handleSubscriptionExpired(event);
        break;
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        await handleSubscriptionPaymentFailed(event);
        break;
      case "BILLING.SUBSCRIPTION.RE-ACTIVATED":
        await handleSubscriptionReactivated(event);
        break;
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await handleSubscriptionSuspended(event);
        break;
      case "BILLING.SUBSCRIPTION.UPDATED":
        await handleSubscriptionUpdated(event);
        break;
      default:
        log.warn(`Unhandled event type: ${event.event_type}`);
    }

    // Acknowledge receipt of the webhook
    successResponse(
      res,
      `Webhook event ${event.event_type} processed successfully`
    );
  } catch (error) {
    log.error("Error processing PayPal webhook:", error);
    errorResponse(res, error);
  }
};

const verifyWebhookSignature = (
  webhookId: string,
  event: any,
  certUrl: string,
  transmissionId: string,
  timestamp: string,
  signature: string
): boolean => {
  const message = `${transmissionId}|${timestamp}|${webhookId}|${crypto
    .createHash("sha256")
    .update(JSON.stringify(event))
    .digest("hex")}`;
  const paypalCert = getPaypalCertificate(certUrl); // Implement this function to fetch the PayPal certificate
  const verifier = crypto.createVerify("sha256");
  verifier.update(message);
  return verifier.verify(paypalCert, signature, "base64");
};

const getPaypalCertificate = (certUrl: string): string => {
  // TODO:Implement this function to fetch the PayPal certificate from the provided URL
  // This is a placeholder implementation
  return "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----";
};

const handleSubscriptionActivated = async (event: any) => {
  const subscriptionId = event.resource.id;
  const subscription = await subscriptionRepository.findOne({
    where: { subscription_id: subscriptionId },
  });
  if (subscription) {
    subscription.status = "ACTIVE";
    await subscriptionRepository.save(subscription);
  }
};

const handleSubscriptionCancelled = async (event: any) => {
  const subscriptionId = event.resource.id;
  const subscription = await subscriptionRepository.findOne({
    where: { subscription_id: subscriptionId },
  });
  if (subscription) {
    subscription.status = "CANCELLED";
    subscription.cancellation_date = new Date();
    await subscriptionRepository.save(subscription);
  }
};

const handleSubscriptionCreated = async (event: any) => {
  const subscriptionId = event.resource.id;
  const newSubscription = new Subscriptions();
  newSubscription.subscription_id = subscriptionId;
  newSubscription.user_id = event.resource.subscriber.payer_id; // Adjust based on your data
  newSubscription.plan_id = event.resource.plan_id;
  newSubscription.status = "PENDING";
  await subscriptionRepository.save(newSubscription);
};

const handleSubscriptionExpired = async (event: any) => {
  const subscriptionId = event.resource.id;
  const subscription = await subscriptionRepository.findOne({
    where: { subscription_id: subscriptionId },
  });
  if (subscription) {
    subscription.status = "EXPIRED";
    await subscriptionRepository.save(subscription);
    await sendEmail("mybusiness6691@gmail.com");
  }
};

const handleSubscriptionPaymentFailed = async (event: any) => {
  const subscriptionId = event.resource.id;
  const subscription = await subscriptionRepository.findOne({
    where: { subscription_id: subscriptionId },
  });
  if (subscription) {
    subscription.last_payment_status = "FAILED";
    subscription.failure_reason = event.resource.failure_reason;
    await subscriptionRepository.save(subscription);
  }
};

const handleSubscriptionReactivated = async (event: any) => {
  const subscriptionId = event.resource.id;
  const subscription = await subscriptionRepository.findOne({
    where: { subscription_id: subscriptionId },
  });
  if (subscription) {
    subscription.status = "ACTIVE";
    await subscriptionRepository.save(subscription);
  }
};

const handleSubscriptionSuspended = async (event: any) => {
  const subscriptionId = event.resource.id;
  const subscription = await subscriptionRepository.findOne({
    where: { subscription_id: subscriptionId },
  });
  if (subscription) {
    subscription.status = "SUSPENDED";
    await subscriptionRepository.save(subscription);
  }
};

const handleSubscriptionUpdated = async (event: any) => {
  const subscriptionId = event.resource.id;
  const subscription = await subscriptionRepository.findOne({
    where: { subscription_id: subscriptionId },
  });
  if (subscription) {
    subscription.status = event.resource.status;
    subscription.next_billing_time =
      event.resource.billing_info.next_billing_time;
    await subscriptionRepository.save(subscription);
  }
};
