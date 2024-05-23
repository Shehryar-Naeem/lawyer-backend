import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import ClientCase from "../models/clientCase/ClientCaseModel.js";
import { AuthenticatedRequest } from "../types/types.js";
import { User } from "../models/userModel/userModel.js";
import { ApiFeatures, ErrorHandler } from "../utils/utility-class.js";
import { Gig } from "../models/GigsModel/gigModel.js";
import { Auth } from "firebase-admin/auth";
import { Client } from "../models/userModel/clientModel.js";
import Bid from "../models/bid/bidModel.js";
const creatPost = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user: any = req.user?._id;

    const {
      title,
      description,
      budget,

      // documents,
      category,
      majorIssues,
      experience,
      location,
    } = req.body;
    if (
      !title ||
      !description ||
      !majorIssues ||
      !experience ||
      !budget ||
      !category ||
      !location
    ) {
      return next(new ErrorHandler("All fields are required", 400));
    }
    if (budget < 0) {
      return next(new ErrorHandler("Budget cannot be negative", 400));
    }
    const newCase = new ClientCase({
      user: user.toString(),
      title,
      description,
      budget,
      majorIssues,
      experience,
      // documents,
      category,
      location,
    });
    await newCase.save();

    res.status(200).json({
      success: true,
      message: "Case created successfully",
      data: newCase,
    });
  }
);

const updateStopRecievingRequest = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const postId = req.params.id.toString();

    const post = await ClientCase.findById({ _id: postId });
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }

    post.isStopRecievingRequest = true;
    await post.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "Case updated successfully",
      data: post,
    });
  }
);

const updatePost = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const postId = req.params.id.toString();

    const post = await ClientCase.findById({ _id: postId });
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }

    const {
      title,
      description,
      budget,
      category,
      majorIssues,
      experience,
      location,
    } = req.body;
    if (title !== undefined || title !== null) post.title = title;
    if (description !== undefined || description !== null)
      post.description = description;
    if (budget !== undefined || budget !== null) post.budget = budget;
    if (category !== undefined || category !== null) post.category = category;
    if (majorIssues !== undefined || majorIssues !== null)
      post.majorIssues = majorIssues;
    if (experience !== undefined || experience !== null)
      post.experience = experience;

    if (location !== undefined || location !== null) post.location = location;
    await post.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "Case updated successfully",
      data: post,
    });
  }
);

const deletePost = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const postId = req.params.id.toString();

    console.log("postId", postId);

    const post = await ClientCase.findByIdAndDelete({ _id: postId });
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Case deleted successfully",
      data: post,
    });
  }
);

const getMePosts = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user?._id;
    const posts = await ClientCase.find({ user: user }).populate(
      "user",
      "name avatar"
    );
    res.status(200).json({
      success: true,
      data: posts,
    });
  }
);

const getPost = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.id.toString();
    const post = await ClientCase.findById({ _id: postId }).populate(
      "user",
      "name avatar"
    );
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }
    res.status(200).json({
      success: true,
      data: post,
    });
  }
);
const updateThePostStatus = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const postId = req.params.id.toString();
    const user = req.user?._id.toString();
    const post = await ClientCase.findById({ _id: postId });
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }

    if (post.user.toString() !== user) {
      return next(
        new ErrorHandler("You are not authorized to update this post", 401)
      );
    }

    const { status } = req.body;

    post.status = status;
    await post.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "Case updated successfully",
      data: post,
    });
  }
);
const getPostWhoStatusIsHired = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user?._id.toString();
    const posts = await ClientCase.find({
      user: user,
      status: { $in: ["hired", "completed"] },
    })
      .populate("hiredLawyer")
      .populate("hiredBid");
    res.status(200).json({
      success: true,
      data: posts,
    });
  }
);
const getAllJobs = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const resultPerPage: number = 10;
    const apiFeature = new ApiFeatures(
      ClientCase.find().populate("user", "name avatar"),
      req.query
    )
      .searchByFields()
      .filter()
      .pagination(resultPerPage);

    const jobs = await apiFeature.query;
    const jobCounts = await ClientCase.countDocuments();

    res.status(200).json({
      success: true,
      data: jobs,
      jobCounts,
      resultPerPage,
    });
  }
);
const getAllJobsByAdmin = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const jobs = await ClientCase.find();

    res.status(200).json({
      success: true,
      data: jobs,
    });
  }
);
const updateJobByAdmin = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.id.toString();

    const post = await ClientCase.findById({ _id: postId });
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }
    const {
      title,
      description,
      budget,
      category,
      majorIssues,
      experience,
      location,
    } = req.body;
    if (title !== undefined || title !== null) post.title = title;
    if (description !== undefined || description !== null)
      post.description = description;
    if (budget !== undefined || budget !== null) post.budget = budget;
    if (category !== undefined || category !== null) post.category = category;
    if (majorIssues !== undefined || majorIssues !== null)
      post.majorIssues = majorIssues;
    if (experience !== undefined || experience !== null)
      post.experience = experience;

    if (location !== undefined || location !== null) post.location = location;
    await post.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "Case updated successfully",
      data: post,
    });
  }
);
const getJobByIdByAdmin = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.id.toString();
    const post = await ClientCase.findById({ _id: postId });
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }
    res.status(200).json({
      success: true,
      data: post,
    });
  }
);

const getMeHiredJobs = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const jobs = await ClientCase.find({
        hiredLawyer: userId?.toString(),
        status: { $in: ["hired", "completed"] },
      })
        .populate("user", "name avatar city")
        .populate("hiredBid");

      res.status(200).json({
        success: true,
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  }
);

const getPostStatusToAllowReviewToClient = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const gigId = req.params.id.toString();

    const findGig = await Gig.findById({ _id: gigId });
    if (!findGig) {
      return next(new ErrorHandler("Gig not found", 404));
    }
    const findPost = await ClientCase.findOne({
      user: userId,
      hiredLawyer: findGig.user,
    });

    const postStatus =
      findPost?.status === "completed" && findPost.clientStatus === "completed"
        ? true
        : false;

    res.status(200).json({
      success: true,
      data: postStatus,
    });
  }
);

const completeThePostStatus = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const postId = req.params.id.toString();
    const userId = req.user?._id.toString();

    const post = await ClientCase.findById({ _id: postId });
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }

    if (post.user.toString() !== userId) {
      post.clientStatus = "completed";
      const bid: any = await Bid.findById({ _id: post.hiredBid });
      bid.status = "completed";
      await bid.save({ validateBeforeSave: false });
    } else if (post.user.toString() === userId) {
      post.status = "completed";
    }
    await post.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "Post status updated successfully",
      data: post,
    });
  }
);

export {
  creatPost,
  updateStopRecievingRequest,
  updatePost,
  deletePost,
  getMePosts,
  getPost,
  getAllJobsByAdmin,
  getAllJobs,
  updateJobByAdmin,
  getJobByIdByAdmin,
  updateThePostStatus,
  getPostWhoStatusIsHired,
  getMeHiredJobs,
  getPostStatusToAllowReviewToClient,
  completeThePostStatus,
};
