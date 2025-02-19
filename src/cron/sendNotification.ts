import { getUserById } from "../api/user/user.controller";
import log from "../utils/logger";
import sendEmail from "../utils/sendCustomEmail";

const sendNotification = async (userId?: string, status?: string) => {
  try {
    if (userId && status) {
      const user = await getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      sendEmail(user.email);
      return;
    }

    // TODO: Once we have a list of subscribed users, implement logic here to send notifications
    const userEmail = "mybusiness6691@gmail.com";
    sendEmail(userEmail);
  } catch (error) {
    log.error("Error sending notification:", error);
  }
};

export default sendNotification;
