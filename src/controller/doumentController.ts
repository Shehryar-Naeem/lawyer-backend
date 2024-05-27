import { NextFunction, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import { AuthenticatedRequest } from "../types/types.js";
import { ErrorHandler } from "../utils/utility-class.js";
import ClientCase from "../models/clientCase/ClientCaseModel.js";
import { uploadFileToCloudinary } from "../utils/jwtToken.js";
import Document from "../models/documentModel/index.js";

const uploadFile = TryCatch(
  async (req: any, res: Response, next: NextFunction) => {
    const files = req.files[0];
    console.log(files);

    const userId = req.user._id as string;
    const postId = req.params.id as string;

    if (files.length < 1)
      return next(new ErrorHandler("Please Upload Attachments", 400));

    if (files.length > 5)
      return next(new ErrorHandler("Files Can't be more than 5", 400));

    const findPost = await ClientCase.findOne({ _id: postId, user: userId });

    if (!findPost) return next(new ErrorHandler("Post Not Found", 404));
    const attachments = await uploadFileToCloudinary(files);

    console.log(attachments);

    const uploadDocument = await Document.create({
      postId,
      file: attachments,
      sender: userId,
      receiver: findPost?.hiredLawyer,
    });

    res.status(200).json({
      success: true,
      data: uploadDocument,
    });
  }
);

const getAllDocumentsRelatedToPost = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const postId = req.params.id as string;
    const userId = req?.user?._id as string;

    const findPost = await ClientCase.findOne({ _id: postId, user: userId });

    if (!findPost) return next(new ErrorHandler("Post Not Found", 404));

    const documents = await Document.find({
      postId: postId,
      $or: [{ sender: userId }, { receiver: userId }],
    });

    res.status(200).json({
      success: true,
      data: documents,
    });
  }
);
const deleteDocument = TryCatch(
  async (req: any, res: Response, next: NextFunction) => {
    const documentId = req.params.id as string;
    const userId = req?.user?._id as string;

    console.log(documentId, userId);

    const document = await Document.findOneAndDelete({
      _id: documentId,
      sender: userId.toString(),
    });

    console.log(document);

    if (!document) return next(new ErrorHandler("Document Not Found", 404));

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

export { uploadFile, getAllDocumentsRelatedToPost, deleteDocument };
