import sgMail from "@sendgrid/mail";
import env from "../config/environment.config";
import log from "./logger";
sgMail.setApiKey(env.email.apiKey!);

const sendEmail = async (toEmail: string) => {
  const msg = {
    to: [`${toEmail}`],
    from: {
      name: "Pro Plan Subscription Cunfirm",
      email: env.email.fromEmail!, // Use the email address or domain you verified above
    },
    subject: "Welcome to magure.com – You’re In!",
    // text: 'and easy to do anywhere, even with Node.js',
    // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    templateId: env.email.sendGridTemId!,
    dynamicTemplateData: {
      website: "magure.com",
      replyEmail: "test@magureinc.com",
    },
  };

  try {
    await sgMail.send(msg);
    log.info("Email has been sent!");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
export default sendEmail;
