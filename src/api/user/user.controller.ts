import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import { User } from "./user.model";
import log from "../../utils/logger";
import { ObjectId } from "mongodb";

const userRepository = AppDataSource.getRepository(User);

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, status } = req.body;

    if (!name || !email || !phone) {
      throw new Error("All user fields are required");
    }

    const user = new User();
    user.name = name;
    user.email = email;
    user.phone = phone;
    user.status = status ?? true;

    const savedUser = await userRepository.save(user);

    successResponse(res, "User created successfully", savedUser);
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let user;
    if (id) {
      user = await userRepository.findOneBy({ _id: new ObjectId(id) });
    } else {
      user = await userRepository.find();
    }

    if (!user) {
      throw new Error("User not found");
    }

    successResponse(res, "User details retrieved successfully", user);
  } catch (error) {
    log.error("Error fetching user details:", error);
    errorResponse(res, error);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status } = req.body;

    if (!id) {
      throw new Error("User ID is required");
    }

    const user = await userRepository.findOneBy({ _id: new ObjectId(id) });

    console.log("user", user);

    if (!user) {
      throw new Error("User not found");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.status = status ?? user.status;

    const savedUser = await userRepository.save(user);

    successResponse(res, "User updated successfully", savedUser);
  } catch (error) {
    log.error("Error updating user:", error);
    errorResponse(res, error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error("User ID is required");
    }

    const user = await userRepository.findOneBy({ _id: new ObjectId(id) });

    if (!user) {
      throw new Error("User not found");
    }

    await userRepository.remove(user);

    successResponse(res, "User deleted successfully");
  } catch (error) {
    log.error("Error deleting user:", error);
    errorResponse(res, error);
  }
};

export const getUserById = async (userId: string) => {
  try {
    const user = await userRepository.findOneBy({ _id: new ObjectId(userId) });
    return user;
  } catch (error) {
    log.error("Error fetching user by ID:", error);
    throw error;
  }
};
