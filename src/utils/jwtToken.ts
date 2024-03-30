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

export default sendToken;
