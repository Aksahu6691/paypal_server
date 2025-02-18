import sendEmail from "../utils/sendCustomEmail";

const sendNotification = () => {
  // TODO: Once we have a list of subscribed users, implement logic here to send notifications
  const userEmail = "mybusiness6691@gmail.com";
  sendEmail(userEmail);
};

export default sendNotification;
