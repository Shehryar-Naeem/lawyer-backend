import { Response } from "express";
import { CombinedType } from "../types/types.js";

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
    redirectUrl 
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

export const  getOtherUserId = (conversation:any, userId:any) => {
  return conversation.participants.senderId.toString() === userId.toString()
    ? conversation.participants.receiverId
    : conversation.participants.senderId;
};
export default sendToken;



