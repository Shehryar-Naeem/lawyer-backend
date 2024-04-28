import { NextFunction, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import { AuthenticatedRequest } from "../types/types.js";
import { ErrorHandler } from "../utils/utility-class.js";
import Conversation from "../models/conversation/conversation.js";
import { User } from "../models/userModel/userModel.js";
import sendMail from "../utils/sendMail.js";

const createConversation = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { receiverId } = req.body;
    const senderId = req?.user?._id.toString();
    const userEmail = req?.user?.email;

    if (!senderId || !receiverId) {
      return next(new ErrorHandler("Invalid data", 400));
    }
    if (senderId === receiverId) {
      return next(new ErrorHandler("You can't send message to yourself", 400));
    }
    const findConversation = await Conversation.findOne({
      "participants.senderId": senderId,
      "participants.receiverId": receiverId,
    });
    if (findConversation) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists",
        conversation: findConversation,
      });
    }
    const receiverUser = await User.findOne({ _id: receiverId });
    if (!receiverUser) {
      return next(new ErrorHandler("User not found", 404));
    }
    const receiverEmail = receiverUser.email;
    console.log(receiverEmail);

    await sendMail(
      receiverEmail,
      "Pak Law",
      `You have a new message from ${userEmail}`
    );

    const newConversation = new Conversation({
      participants: {
        senderId,
        receiverId,
      },
    });
    await newConversation.save();

    return res.status(201).json({
      success: true,
      message: "Conversation created",
      conversation: newConversation,
    });
  }
);

const getMeConversations = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req?.user?._id.toString();
    const conversations = await Conversation.find({
      $or: [
        {  "participants.senderId": userId},
        {  "participants.receiverId": userId, }
      ]
      // "participants.senderId": userId,

    }).populate("participants.receiverId", "name avatar");
  
    
    res.status(200).json({
      success: true,
      conversations,
    });
  }
);

const deleteConversation = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req?.user?._id.toString();
    const conversation = await Conversation.findOneAndDelete({
      _id: id,
      "participants.senderId": userId,
    });
    if (!conversation) {
      return next(new ErrorHandler("Conversation not found", 404));
    }
    return res.status(200).json({
      success: true,
    });
  }
);

export { createConversation, getMeConversations, deleteConversation };
