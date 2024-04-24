import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import ClientCase from "../models/clientCase/ClientCaseModel.js";
import { AuthenticatedRequest } from "../types/types.js";
import { User } from "../models/userModel/userModel.js";
import { ErrorHandler } from "../utils/utility-class.js";
const creatPost = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user:any = req.user?.roles;

    const clientRole = user?.find((role:any) => role.roleType === "client");
    if (!clientRole) {
      return next(new ErrorHandler("Unauthorized access", 401));
    }

   
    const client = clientRole._id;
    console.log("client_id", client);

    const {
      title,
      description,
      budget,
      duration,
      // documents,
      expertise,
      // status,
      locationPreference,
    } = req.body;
    if (
      !title ||
      !description ||
      !budget ||
      !duration ||
      // !documents ||
      !expertise ||
      // !status ||
      !locationPreference
    ) {
      return next(new ErrorHandler("All fields are required", 400));
    }
    if (budget < 0) {
      return next(new ErrorHandler("Budget cannot be negative", 400));
    }
    const newCase = new ClientCase({
      client,
      title,
      description,
      budget,
      duration,
      // documents,
      expertise,
      locationPreference,
    });
    await newCase.save();

    res.status(200).json({
      success: true,
      message: "Case created successfully",
      data: newCase,
    });
  }
);
export { creatPost };
