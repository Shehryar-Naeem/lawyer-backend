import { NextFunction, Response } from "express";
import Message from "../models/messages/message.js";
import { AuthenticatedRequest } from "../types/types.js";
import { ErrorHandler } from "../utils/utility-class.js";
import cloudinary from "cloudinary";
import Conversation from "../models/conversation/conversation.js";
import { getOtherUserId } from "../utils/jwtToken.js";
import { getRecipientSocketId, io } from "../socket/socket.js";


const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { text } = req.body;
  const sender = req?.user?._id;
  const conversationId = req.params.id;

  let img = req.body?.img;

  if (!text) {
    return next(new ErrorHandler("Invalid data", 400));
  }
  const conversation: any = await Conversation.findById({
    _id: conversationId.toString(),
  });
  if (!conversation) {
    return next(new ErrorHandler("Conversation not found", 404));
  }
  const receiverId = await getOtherUserId(conversation, sender);

  if (
    sender?.toString() !== conversation.participants.senderId.toString() &&
    sender?.toString() !== conversation.participants.receiverId.toString()
  ) {
    return next(new ErrorHandler("Unauthorized", 401));
  }
  if (img) {
    const imgResponse = await cloudinary.v2.uploader.upload(img, {
      folder: "chat",
      transformation: { width: 500, height: 500, crop: "fill" },
    });
    img = {
      public_id: imgResponse.public_id,
      url: imgResponse.secure_url,
    };
  }
  const messageForRealTime = {
    text,
    sender,
    receiver: receiverId,
    img: img || "",
  };

  const receiverSocketId = getRecipientSocketId(receiverId.toString());
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", {
      message: messageForRealTime,
      conversationId: conversationId.toString(),
    });

    io.to(receiverSocketId).emit("newMessageNotification", {
      conversationId: conversationId.toString(),
    });
  }

  const newMessage = new Message({
    conversationId: conversationId.toString(),
    sender,
    receiver: receiverId,
    text,
    img: img || "",
  });

  await Promise.all([
    newMessage.save(),

    conversation.updateOne({
      latestMessage: {
        text,
        sender,
        seen: false,
      },
    }),
  ]);

  return res.status(201).json({
    success: true,
    message: newMessage,
    conversationId: conversationId.toString(),
  });
};

const getSingleConversationMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const conversationId = req.params.id;
  // const { page = 1 }: any = req.query;
  const userId = req?.user?._id;
  // const resultPerPage = 20;
  // const skip: any = (page - 1) * resultPerPage;

  const conversation: any = await Conversation.findById({
    _id: conversationId.toString(),
  });
  if (!conversation) {
    return next(new ErrorHandler("Conversation not found", 404));
  }
  if (
    userId?.toString() !== conversation.participants.senderId.toString() &&
    userId?.toString() !== conversation.participants.receiverId.toString()
  ) {
    return next(new ErrorHandler("Unauthorized", 401));
  }

  const [messages] = await Promise.all([
    Message.find({
      conversationId: conversationId.toString(),
    }).sort({ createdAt: -1 }),
    // .skip(skip)
    // .limit(resultPerPage)
    // .lean(),
    // Message.countDocuments({ conversationId: conversationId.toString() }),
  ]);

  // const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;
  // const messages = await Message.find({
  //   conversationId: conversationId.toString(),
  // });

  return res.status(200).json({
    success: true,
    messages: messages.reverse(),
    // totalPages,
  });
};

const deleteMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req?.user?._id.toString();
  const message = await Message.findOneAndDelete({
    _id: id,
    sender: userId,
  });
  if (!message) {
    return next(new ErrorHandler("Message not found", 404));
  }
  return res.status(200).json({
    success: true,
  });
};

export { sendMessage, getSingleConversationMessages, deleteMessage };
