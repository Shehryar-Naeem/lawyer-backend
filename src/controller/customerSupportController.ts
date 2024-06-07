import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utility-class.js";
import CustomerSupport from "../models/customerSupport/index.js";
import { sendMailToAdmin } from "../utils/sendMail.js";
import { TryCatch } from "../middleware/error.js";

const customerSupportMessage = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    await CustomerSupport.create({
      name,
      email,
      message,
    });

    await sendMailToAdmin(email,`Customer support ${name}`, `message: ${message} from ${email}`);

    res.status(200).json({
      success: true,
      message: "Customer support message sent successfully",
    });
  }
);

const getAllCustomerSupportMessages = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const messages = await CustomerSupport.find();
    res.status(200).json({
      success: true,
      messages,
    });
  }
);

export { customerSupportMessage, getAllCustomerSupportMessages };
