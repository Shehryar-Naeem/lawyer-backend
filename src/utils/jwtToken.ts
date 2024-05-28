import { Response } from "express";
import { CombinedType } from "../types/types.js";
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuid } from 'uuid';
import { Express } from 'express';

const sendToken = (
  user: CombinedType,
  statusCode: number,
  res: Response,
  msg: string,

  redirectUrl?: string
) => {
  const token = user.getJWTToken();
  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  return res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: user,
    token,
    msg,
    redirectUrl,
  });
};
// export const getSockets = (users = []) => {
//   const sockets = users.map((user) => userSocketIDs.get(user.toString()));

//   return sockets;
// };

// const emitEvent = (req:any, event:any, users:any, data:any) => {
//   const io = req.app.get("io");
//   const usersSocket = getSockets(users);
//   io.to(usersSocket).emit(event, data);
// };

export const getOtherUserId = (conversation: any, userId: any) => {
  return conversation.participants.senderId.toString() === userId.toString()
    ? conversation.participants.receiverId
    : conversation.participants.senderId;
};
export default sendToken;

export const getBase64 = (file: any) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;



// export const uploadFileToCloudinary = async (file: any) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(
//       getBase64(file),
//       {
//         folder: "lawyer-market_docuemnt",
//         resource_type: "auto",
//         public_id: uuid(),
//       },
//       (error, result:any) => {
//         if (error) return reject(error);
//         resolve({
//           public_id: result.public_id,
//           url: result.secure_url,
//         });
//       }
//     );
//   });
// };



export const uploadFileToCloudinary = (file: Express.Multer.File): Promise<{ public_id: string, url: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "lawyer-market_document",
        resource_type: "auto",
        public_id: uuid(),
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error); // Log error details
          return reject(error);
        }
        if (!result) {
          return reject(new Error('No result returned from Cloudinary'));
        }
        resolve({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};