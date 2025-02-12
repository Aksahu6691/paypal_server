import express from "express";
import { getPlanDetail } from "./plan.controller";

const planRoutes = express.Router();

planRoutes.get("/get/:planId", getPlanDetail);

export default planRoutes;
