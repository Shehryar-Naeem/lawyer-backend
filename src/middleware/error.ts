import { NextFunction, Request, Response } from "express";
import { ControllerFunc } from "../types/types.js";
import { ErrorHandler } from "../utils/utility-class.js";


export const TryCatch =
  (func: ControllerFunc) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };


  export const errorMiddlerware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((error: any) => error.message);
      err = new ErrorHandler(errors.join(', '), 400);
    }
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`;
      err = new ErrorHandler(message, 400);
    }
    if (err.code === 11000) {
      
      const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
      err = new ErrorHandler(message, 400);
    }
    
    // Wrong JWT error
    if (err.name === "JsonWebTokenError") {
      const message = `Json Web Token is invalid, Try again `;
    
      err = new ErrorHandler(message, 400);
    }
  
    // JWT EXPIRE error
    if (err.name === "TokenExpiredError") {
      const message = `Json Web Token is Expired, Try again `;
      err = new ErrorHandler(message, 400);
    }
  
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  };