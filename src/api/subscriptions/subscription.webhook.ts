import { Request, Response } from "express";
import log from "../../utils/logger";
import { errorResponse } from "../../utils/apiResponse";
import { AppDataSource } from "../../config/database.config";
import { Subscriptions } from "./subscription.model";
import sendEmail from "../../utils/sendCustomEmail";
import { verifyWebhookSignature } from "../../utils/verifyWebhookEvent";
import sendNotification from "../../cron/sendNotification";

const subscriptionRepository = AppDataSource.getRepository(Subscriptions);

export const handlePaypalWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;
    const eventHeaders = req.headers;

    console.info(`✅ incoming PayPal webhook event: ${event.event_type}`);

    // Verify the webhook signature
    const verified = await verifyWebhookSignature(eventHeaders, event);
    console.log("😊 verification", verified);

    if (!verified) {
      throw new Error("Webhook signature verification failed");
    }

    // Return a 200 status code immediately to acknowledge the webhook event
    // before the connection is closed.
    res.sendStatus(200);

    // Proceed with handling the webhook events
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
        await handleSubscriptionActivated(event);
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

    log.info(`Webhook event ${event.event_type} processed successfully`);
  } catch (error: any) {
    log.error("Error processing PayPal webhook:", error);
    errorResponse(res, error);
  }
};

const handleSubscriptionActivated = async (event: any) => {
  const subscriptionId = event.resource.id;
  const subscription = await subscriptionRepository.findOne({
    where: { subscription_id: subscriptionId },
  });
  if (subscription) {
    subscription.status = "ACTIVE";
    await subscriptionRepository.save(subscription);
    await sendNotification(subscription.user_id, subscription.status);
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
    await sendNotification(subscription.user_id, subscription.status);
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
  await sendNotification(newSubscription.user_id, newSubscription.status);
};

const handleSubscriptionExpired = async (event: any) => {
  const subscriptionId = event.resource.id;
  const subscription = await subscriptionRepository.findOne({
    where: { subscription_id: subscriptionId },
  });
  if (subscription) {
    subscription.status = "EXPIRED";
    await subscriptionRepository.save(subscription);
    await sendNotification(subscription.user_id, subscription.status);
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
    await sendNotification(subscription.user_id, subscription.status);
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
    await sendNotification(subscription.user_id, subscription.status);
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
    await sendNotification(subscription.user_id, subscription.status);
  }
};
