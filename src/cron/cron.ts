import cron from "node-cron";
import sendNotification from "./sendNotification";

cron.schedule(
  "30 10  * * *",
  () => {
    console.log("Running a Cron job at 10:30 AM at Asia timezone");
    sendNotification();
  },
  {
    scheduled: true,
    timezone: "Asia/kolkata",
  }
);

// Will use later
// cron.schedule(
//   "* * * * *",
//   () => {
//     console.log("Running a job every minute at Asia timezone");
//   },
//   {
//     scheduled: true,
//     timezone: "Asia/kolkata",
//   }
// );
