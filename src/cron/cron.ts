import cron from "node-cron";

cron.schedule(
  "30 10  * * *",
  () => {
    console.log("Running a Cron job at 10:30 AM at Asia timezone");
  },
  {
    scheduled: true,
    timezone: "Asia/kolkata",
  }
);

cron.schedule(
  "* * * * *",
  () => {
    console.log("Running a job every minute at Asia timezone");
  },
  {
    scheduled: true,
    timezone: "Asia/kolkata",
  }
);
