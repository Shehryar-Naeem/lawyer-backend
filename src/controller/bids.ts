import { NextFunction, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import { AuthenticatedRequest } from "../types/types.js";
import { ErrorHandler } from "../utils/utility-class.js";
import Bid from "../models/bid/bidModel.js";
import ClientCase from "../models/clientCase/ClientCaseModel.js";
import sendMail from "../utils/sendMail.js";

const sendProposal = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { proposal, pricing } = req.body;
    const postId = req.params.id;
    const userId = req.user?._id;
    if (!proposal || !pricing) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    if (pricing < 0) {
      return next(new ErrorHandler("Pricing cannot be negative", 400));
    }

    const alreadyBid = await Bid.findOne({
      case: postId.toString(),
      lawyer: userId?.toString(),
    });
    if (alreadyBid) {
      return next(
        new ErrorHandler("You have already send a proposal on this job", 400)
      );
    }

    const findPost: any = await ClientCase.findById({
      _id: postId.toString(),
    }).populate({
      path: "user",
      select: "email name",
    });
    if (!findPost) {
      return next(new ErrorHandler("Post not found", 404));
    }

    if (findPost.user._id.toString() === userId?.toString()) {
      return next(
        new ErrorHandler("You cannot send proposal to your own post", 400)
      );
    }
    if (findPost.isStopRecievingRequest) {
      return next(
        new ErrorHandler("This post is no longer accepting request", 400)
      );
    }
    if (findPost.status !== "looking") {
      return next(
        new ErrorHandler("This post is no longer accepting request", 400)
      );
    }

    const bid = new Bid({
      lawyer: userId,
      case: postId,
      client: findPost.user._id.toString(),
      proposal,
      pricing,
    });
    await bid.save();
    try {
      await sendMail(
        findPost?.user?.email,
        `New Proposal ${req?.user?.name}`,
        `new proposal comes from ${req?.user?.name}`
      );
    } catch (error) {
      return next(new ErrorHandler("Error sending mail", 500));
    }
    res.status(200).json({
      success: true,
      message: "Proposal sent successfully",
      data: bid,
    });
  }
);

const acceptBid = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const bidId = req.params.id;
    const { status } = req.body;
    const userId = req.user?._id;
    const bid: any = await Bid.findOne({
      _id: bidId.toString(),
      client: userId?.toString(),
    }).populate("lawyer");
    if (!bid) {
      return next(new ErrorHandler("Bid not found", 404));
    }
    console.log("bid", bid);

    const post = await ClientCase.findById({
      _id: bid.case.toString(),
    });
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }
    if (status === "accepted") {
      bid.status = status.toLowerCase();
    } else if (status === "rejected") {
      bid.status = status.toLowerCase();
    } else if (status === "hired") {
      bid.status = status.toLowerCase();
      post.hiredBid = bid._id;
      post.hiredLawyer = bid.lawyer;
      post.status = status.toLowerCase();
    } else {
      return next(new ErrorHandler("Invalid status", 400));
    }

    await Promise.all([bid.save(), post.save()]);
    try {
      await sendMail(
        bid?.lawyer?.email,
        `Bid ${status}`,
        `Your bid has been ${status} by the client ${req?.user?.name}`
      );
    } catch (error) {
      return next(new ErrorHandler("Error sending mail", 500)); 
    }

    res.status(200).json({
      success: true,
      message: "Bid accepted successfully",
      data: bid,
    });
  }
);

const getMebids = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const bids = await Bid.find({ lawyer: userId?.toString() })
      .populate("case")
      .populate("client");

    res.status(200).json({
      success: true,
      data: bids,
    });
  }
);

const getMeAcceptedBid = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const bids = await Bid.find({
      lawyer: userId?.toString(),
      status: "accepted",
    })
      .populate("case")
      .populate("client");
    res.status(200).json({
      success: true,
      data: bids,
    });
  }
);

// const getBidRequestRelatedToPost = TryCatch(
//   async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     const postId = req.params.id;
//     const userId = req.user?._id;
//     const post = await ClientCase.findById({ _id: postId.toString() });
//     if (!post) {
//       return next(new ErrorHandler("Post not found", 404));
//     }
//     if (post?.user.toString() !== userId?.toString()) {
//       return next(
//         new ErrorHandler("You are not authorized to access this resource", 403)
//       );
//     }
//     const bids = await Bid.find({ case: postId.toString() }).populate("lawyer").sort({createdAt: -1});
//     res.status(200).json({
//       success: true,
//       data: bids,
//     });
//   }
// );

const getAllBidsRelatedToPost = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const postId = req.params.id;
    const userId = req.user?._id;
    const post = await ClientCase.findById({ _id: postId.toString() });
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }
    if (post?.user.toString() !== userId?.toString()) {
      return next(
        new ErrorHandler("You are not authorized to access this resource", 403)
      );
    }
    const bids = await Bid.find({ case: postId.toString() })
      .populate("lawyer")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: bids,
    });
  }
);

export {
  sendProposal,
  acceptBid,
  getMebids,
  getMeAcceptedBid,
  getAllBidsRelatedToPost,
};
