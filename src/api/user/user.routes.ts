import express from "express";
import { createUser, deleteUser, getUser, updateUser } from "./user.controller";

const userRoutes = express.Router();

userRoutes
  .get("/get/:id?", getUser)
  .post("/create", createUser)
  .patch("/update/:id", updateUser)
  .delete("/delete/:id", deleteUser);

export default userRoutes;
