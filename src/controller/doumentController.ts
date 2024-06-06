import { NextFunction, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import { AuthenticatedRequest } from "../types/types.js";
import { ErrorHandler } from "../utils/utility-class.js";
import ClientCase from "../models/clientCase/ClientCaseModel.js";
import { uploadFileToCloudinary } from "../utils/jwtToken.js";
import Document from "../models/documentModel/index.js";

import { v2 as cloudinary } from "cloudinary";
import { Gig } from "../models/GigsModel/gigModel.js";
import Hiring from "../models/hiringModel/index.js";
import streamifier from "streamifier";

const uploadFile = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const files = req.files as any;
    console.log(files);

    const userId = req?.user?._id as string;
    const hiring = req.params.id as string;
    if (!files) {
      return next(new ErrorHandler("Please Upload Attachments", 400));
    }

    if (files.length < 1)
      return next(new ErrorHandler("Please Upload Attachments", 400));

    if (files.length > 5)
      return next(new ErrorHandler("Files Can't be more than 5", 400));

    const findHiring = await Hiring.findOne({
      _id: hiring,
      $or: [{ client: userId }, { lawyer: userId }],
    });
    console.log("findHiring", findHiring);

    const findOtheId =
      findHiring?.client.toString() === userId.toString()
        ? findHiring?.lawyer.toString()
        : findHiring?.client.toString();

    console.log("findOtheId", findOtheId);

    if (!findHiring) return next(new ErrorHandler("Hiring Not Found", 404));

    // const attachments = await cloudinary.uploader.upload(files[0].buffer, {
    //   folder: "documents",
    // });
    const attachments: any = await uploadFileToCloudinary(files[0]);
    console.log("attachments", attachments);
    const uploadDocument = await Document.create({
      hiring,
      file: {
        public_id: attachments.public_id,
        url: attachments.url,
      },
      sender: userId,
      receiver: findOtheId,
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

    // const findPost = await ClientCase.findOne({ _id: postId });

    // if (!findPost) return next(new ErrorHandler("Post Not Found", 404));
    const hiring: any = await Hiring.findOne({
      _id: postId,
      $or: [{ client: userId }, { lawyer: userId }],
    });

    if (!hiring) return next(new ErrorHandler("Hiring Not Found", 404));

    console.log(hiring);

    if (hiring.type === "job") {
      const findJob = await ClientCase.findOne({ _id: hiring.case.toString() });
      if (!findJob) return next(new ErrorHandler("Post Not Found", 404));
    }
    if (hiring.type === "gig") {
      const findGig = await Gig.findOne({ _id: hiring.gig.toString() });
      if (!findGig) return next(new ErrorHandler("Post Not Found", 404));
    }

    const documents = await Document.find({
      hiring: postId,
      $or: [{ sender: userId }, { receiver: userId }],
    });
    // console.log(documents);

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

    const document = await Document.findOneAndDelete({
      _id: documentId,
      sender: userId.toString(),
    });

    if (!document)
      return next(new ErrorHandler("Can not perform this action ", 404));

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

const findHiringPost = TryCatch(
  async (req: any, res: Response, next: NextFunction) => {
    const postId = req.params.id as string;
    const userId = req?.user?._id as string;

    const hiring = await Hiring.findOne({
      _id: postId,
      $or: [{ client: userId }, { lawyer: userId }],
    });

    if (!hiring) return next(new ErrorHandler("Hiring Not Found", 404));

    if (hiring.case) {
      const findJob = await ClientCase.findOne({
        _id: hiring.case.toString(),
      }).populate("user");
      if (!findJob) return next(new ErrorHandler("Post Not Found", 404));
      return res.status(200).json({
        success: true,
        job: findJob,
      });
    }
    if (hiring.gig) {
      const findGig = await Gig.findOne({
        _id: hiring.gig.toString(),
      }).populate("user");
      if (!findGig) return next(new ErrorHandler("Post Not Found", 404));
      return res.status(200).json({
        success: true,
        gig: findGig,
      });
    }
  }
);

export {
  uploadFile,
  getAllDocumentsRelatedToPost,
  deleteDocument,
  findHiringPost,
};
