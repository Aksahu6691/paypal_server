import express, {
  json,
  NextFunction,
  Request,
  Response,
  urlencoded,
} from "express";
import path from "path";
import {
  checkoutRoutes,
  planRoutes,
  productRoutes,
  subscriptionRoutes,
  userRoutes,
} from "./api";
import "./cron/cron";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:4002",
        "https://fleet-buffalo-advanced.ngrok-free.app",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); // enable static folder
app.use(bodyParser.json());

// Routes
app.use("/api/checkout", checkoutRoutes);
app.use("/api/product", productRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/user", userRoutes);

// If not found api then give message
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(`Can't find ${req.originalUrl} on the server`);
});

// Error Handle
process.on("uncaughtException", (err) => {
  console.error(err.name, err.message);
  console.error("Uncaught Exception occurred! Shutting down...");
  process.exit(1);
});

export default app;
