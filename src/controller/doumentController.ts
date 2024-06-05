import { NextFunction, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import { AuthenticatedRequest } from "../types/types.js";
import { ErrorHandler } from "../utils/utility-class.js";
import ClientCase from "../models/clientCase/ClientCaseModel.js";
import { uploadFileToCloudinary } from "../utils/jwtToken.js";
import Document from "../models/documentModel/index.js";

import { v2 as cloudinary } from "cloudinary";
import { Gig } from "../models/GigsModel/gigModel.js";

const uploadFile = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const files = req.files as any;
    console.log(files);

    const userId = req?.user?._id as string;
    const postId = req.params.id as string;

    // if (files.length < 1)
    //   return next(new ErrorHandler("Please Upload Attachments", 400));

    // if (files.length > 5)
    //   return next(new ErrorHandler("Files Can't be more than 5", 400));

    const findPost = await ClientCase.findOne({ _id: postId });

    const findOtheId =
      findPost?.user.toString() === userId
        ? findPost?.hiredLawyer?.toString()
        : findPost?.user.toString();

    if (!findPost) return next(new ErrorHandler("Post Not Found", 404));
    const attachments:any = await uploadFileToCloudinary(files);
    // const attachments = await cloudinary.uploader.upload(req.body.files, {
    //   folder: "documents",

    // });

    // console.log(attachments);

    // const uploadDocument = await Document.create({
    //   postId,
    //   file: req.files,
    //   sender: userId,
    //   receiver: findOtheId,
    // });

    const uploadDocument = await Document.create({
      postId,
      file: {
        public_id: attachments.public_id,
        url: attachments.secure_url,
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

// const uploadFile = TryCatch(
//   async (req: any, res: Response, next: NextFunction) => {
//     const files = req.body.files as any;
//     console.log(files);

//     const userId = req.user._id as string;
//     const postId = req.params.id as string;

//     // if (files.length < 1)
//     //   return next(new ErrorHandler("Please Upload Attachments", 400));

//     // if (files.length > 5)
//     //   return next(new ErrorHandler("Files Can't be more than 5", 400));

//     const findPost = await ClientCase.findOne({ _id: postId });

//     const findOtheId =
//       findPost?.user.toString() === userId
//         ? findPost?.hiredLawyer?.toString()
//         : findPost?.user.toString();

//     if (!findPost) return next(new ErrorHandler("Post Not Found", 404));
//     // const attachments = await uploadFileToCloudinary(files);
//     const attachments = await cloudinary.uploader.upload(req.body.files, {
//       folder: "documents",

//     });

//     console.log(attachments);

//     const uploadDocument = await Document.create({
//       postId,
//       file: {
//         public_id: attachments.public_id,
//         url: attachments.secure_url,
//       },
//       sender: userId,
//       receiver: findOtheId,
//     });

//     res.status(200).json({
//       success: true,
//       data: uploadDocument,
//     });
//   }
// );

// const uploadFile = TryCatch(
//   async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     const files = req.files as any;
//     console.log(files);

//     const userId = req?.user?._id as string;
//     const postId: any = req.params.id as string;
//     const { type } = req.body;

//     const hiringI = await Hiring.findById({
//       _id: postId.toString(),
//     });

//     if (type === "job") {
//       const findPost = await ClientCase.findOne({ _id: postId });

//       const findOtherId =
//         findPost?.user.toString() === userId
//           ? findPost?.hiredLawyer?.toString()
//           : findPost?.user.toString();

//       if (!findPost) return next(new ErrorHandler("Post Not Found", 404));

//       // Create an array to store file URLs
//       const fileURL = files[0].path;
//       console.log(fileURL);

//       // Create a new document entry in the database
//       const uploadDocuments = await Document.create({
//         postId,
//         file: fileURL, // Store file URLs in the "files" field
//         sender: userId,
//         receiver: findOtherId,
//       });

//       res.status(200).json({
//         success: true,
//         data: uploadDocuments,
//       });
//     } else if (type === "gig") {
//       const findPost = await Gig.findOne({ _id: postId });

//       const findOtherId =
//         findPost?.user.toString() === userId
//           ? findPost?.lawyer?.toString()
//           : findPost?.user.toString();

//       if (!findPost) return next(new ErrorHandler("Post Not Found", 404));

//       // Create an array to store file URLs
//       const fileURL = files[0].path;

//       // Create a new document entry in the database
//       const uploadDocuments = await Document.create({
//         gigId: postId,
//         file: fileURL, // Store file URLs in the "files" field
//         sender: userId,
//         receiver: findOtherId,
//       });

//       res.status(200).json({
//         success: true,
//         data: uploadDocuments,
//       });
//     }
//   }
// );
const getAllDocumentsRelatedToPost = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const postId = req.params.id as string;
    const userId = req?.user?._id as string;

    const findPost = await ClientCase.findOne({ _id: postId });

    if (!findPost) return next(new ErrorHandler("Post Not Found", 404));

    const documents = await Document.find({
      postId: postId,
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

export { uploadFile, getAllDocumentsRelatedToPost, deleteDocument };
