import sendEmail from "../utils/sendCustomEmail";

const sendNotification = () => {
  const userEmail = "mybusiness6691@gmail.com";
  sendEmail(userEmail);
};

export default sendNotification;
