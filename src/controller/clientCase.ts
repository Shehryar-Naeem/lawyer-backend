import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import ClientCase from "../models/clientCase/ClientCaseModel.js";
const createCase = TryCatch(async (req:Request, res : Response, next:NextFunction
    ) => {
  const {
    client,
    title,
    description,
    pricing,
    duration,
    documents,
    expertise,
    status,
    locationPreference,
  } = req.body;
  const newCase = new ClientCase({
    client,
    title,
    description,
    pricing,
    duration,
    documents,
    expertise,
    status,
    locationPreference,
  });
  await newCase.save();

  res.status(200).json({
    success: true,
    message: "Case created successfully",
    data: newCase,
  });
});
export { createCase };
