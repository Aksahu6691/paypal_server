import express, {
  json,
  NextFunction,
  Request,
  Response,
  urlencoded,
} from "express";
import path from "path";
import environmentConfig from "./config/environment.config";

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); // enable static folder

// Routes

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

app.listen(environmentConfig.app.port, () => {
  console.log(`Server running on port ${environmentConfig.app.port}`);
});
