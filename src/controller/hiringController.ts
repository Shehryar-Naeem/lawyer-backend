import { NextFunction, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import { AuthenticatedRequest } from "../types/types.js";
import { Gig } from "../models/GigsModel/gigModel.js";
import { ErrorHandler } from "../utils/utility-class.js";
import Hiring from "../models/hiringModel/index.js";
import Bid from "../models/bid/bidModel.js";
import ClientCase from "../models/clientCase/ClientCaseModel.js";
import sendMail from "../utils/sendMail.js";

const createHiring = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const clientId = req.user?._id;
    const hiringId = req.params.id;

    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ message: "Type is required" });
    }
    if (type !== "job" && type !== "gig") {
      return res.status(400).json({ message: "Invalid type" });
    }
    if (type === "gig") {
      const gig: any = await Gig.findById({
        _id: hiringId,
      }).populate({
        path: "user",
        select: "email name",
      });

      // console.log(  "gig", gig);

      if (!gig) {
        return next(new ErrorHandler("Gig not found", 404));
      }
      const lawyerId = gig.user?._id.toString();
      console.log("lawyerId", lawyerId);

      if (clientId === lawyerId) {
        return next(new ErrorHandler("You can't hire yourself", 400));
      }

      const hiring = new Hiring({
        gig: hiringId,
        type: "gig",
        client: clientId,
        lawyer: lawyerId,
        status: "hired",
      });
      await hiring.save();

      try {
        await sendMail(
          gig.user.email,
          "Hiring ",
          `You have been hired by a client ${req.user?.name}`
        );
      } catch (error) {
        return next(new ErrorHandler("Email not sent", 500));
      }

      return res.status(201).json({
        message: `You succcessfully hired a lawyer`,
        success: true,
        hiring,
      });
    } else if (type === "job") {
      const bid: any = await Bid.findOne({
        _id: hiringId.toString(),
        client: clientId?.toString(),
      }).populate({ path: "lawyer", select: "name email" });

      if (!bid) {
        return next(new ErrorHandler("Bid not found", 404));
      }
      const post = await ClientCase.findById({
        _id: bid.case.toString(),
      });
      if (!post) {
        return next(new ErrorHandler("Post not found", 404));
      }

      bid.status = "hired";
      post.hiredBid = bid._id;
      post.hiredLawyer = bid.lawyer;
      post.status = "hired";
      await post.save();
      await bid.save();

      const hiring = new Hiring({
        case: bid.case,
        type: "job",
        client: clientId,
        lawyer: bid.lawyer,
        bid: bid._id,
        status: "hired",
      });
      await hiring.save();

      try {
        await sendMail(
          bid.lawyer.email,
          "hiring",
          `You have been hired by a client ${req.user?.name}`
        );
      } catch (error) {
        return next(new ErrorHandler("Email not sent", 500));
      }

      return res.status(200).json({
        success: true,
        message: "You have successfully hired a lawyer",
        hiring,
      });
    }
  }
);

const getClientHiring = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const clientId = req.user?._id;
    const hiring = await Hiring.find({ client: clientId })
      .populate("lawyer")
      .populate("gig")
      .populate("case")
      .populate("bid");
    return res.status(200).json({
      success: true,
      hiring,
    });
  }
);

const getLawyerHiring = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const lawyerId = req.user?._id;
    const hiring = await Hiring.find({ lawyer: lawyerId })
      .populate("client")
      .populate("gig")
      .populate("case")
      .populate("bid");
    return res.status(200).json({
      success: true,
      hiring,
    });
  }
);

const markHiringAsCompleted = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log("called");

    const user: any = req.user?._id;
    const hiringId = req.params.id;
    const hiring = await Hiring.findById({
      _id: hiringId,
    });
    if (!hiring) {
      return next(new ErrorHandler("Hiring not found", 404));
    }
    if (
      hiring.client.toString() !== user.toString() &&
      hiring.lawyer.toString() !== user.toString()
    ) {
      return next(
        new ErrorHandler("You are not authorized to complete this hiring", 401)
      );
    }
    if (hiring.client.toString() === user.toString()) {
      if (hiring.lawyer_mark_as_completed) {
        hiring.client_mark_as_completed = true;
        hiring.status = "completed";
      } else {
        return next(
          new ErrorHandler("Lawyer has not marked as completed", 400)
        );
      }
    } else {
      hiring.lawyer_mark_as_completed = true;
    }

    await hiring.save();

    return res.status(200).json({
      success: true,
      message: "Hiring has been completed",
    });
  }
);

export {
  createHiring,
  getClientHiring,
  getLawyerHiring,
  markHiringAsCompleted,
};
