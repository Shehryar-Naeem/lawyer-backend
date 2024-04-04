import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import { ErrorHandler } from "../utils/utility-class.js";
import { Gig } from "../models/GigsModel/gigModel.js";
import { AuthenticatedRequest } from "../types/types.js";
import mongoose, { Types } from "mongoose";
import { Lawyer } from "../models/userModel/laywerModel.js";
import { log } from "console";

// Define a type for the Gig document including pricing information

// Now, you can use this type when casting the Gig document

// Rest of your code...

const createGigStep1 = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const lawyer = req.user?.roles.find((role) => role.roleType === "lawyer");
    const _id = lawyer?._id;
    if (!_id) {
      return next(
        new ErrorHandler("You are not authorized to create a gig", 401)
      );
    }

    const lawyerInstance = await Lawyer.findById(_id);

    if (!lawyerInstance) {
      return next(new ErrorHandler("Lawyer not found", 404));
    }
    if (lawyerInstance.gigs && lawyerInstance.gigs.length >= 2) {
      return next(new ErrorHandler("You can only create up to two gigs", 400));
    }

    const { title, category, description } = req.body;
    if (!title || !category || !description) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }
    const appentGitTitle= `i will ${title}`
    const gig = await Gig.create({
      title: appentGitTitle,
      category,
      description,
      user: userId,
      lawyer: _id,
    });
    lawyerInstance.gigs.push(gig?._id);
    await lawyerInstance.save();

    res.status(201).json({
      success: true,
      gig,
    });
  }
);
const createGigStep2 = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    const lawyer = req.user?.roles.find((role) => role.roleType === "lawyer");
    const lawyerId = lawyer?._id;

    if (!lawyerId) {
      return next(
        new ErrorHandler("You are not authorized to create a gig", 401)
      );
    }

    const gigId = req.params.id;
    const gig = await Gig.findOne({ _id: gigId });

    if (!gig) {
      return next(new ErrorHandler("Gig not found", 404));
    }

    if (gig.user.toString() !== userId.toString()) {
      return next(
        new ErrorHandler("You are not authorized to update this gig", 401)
      );
    }

    const {
      basicPrice,
      basicServices,
      basicDuration,
      basicName,
      basicDescription,
      basicAdditionalCosts,
      standardPrice,
      standardServices,
      standardDuration,
      standardName,
      standardDescription,
      standardAdditionalCosts,
      premiumPrice,
      premiumServices,
      premiumDuration,
      premiumName,
      premiumDescription,
      premiumAdditionalCosts,
    } = req.body;

    if (
      !basicPrice ||
      !basicServices ||
      !basicDuration ||
      !basicName ||
      !basicDescription ||
      !basicAdditionalCosts ||
      !standardPrice ||
      !standardServices ||
      !standardDuration ||
      !standardName ||
      !standardDescription ||
      !standardAdditionalCosts ||
      !premiumPrice ||
      !premiumServices ||
      !premiumDuration ||
      !premiumName ||
      !premiumDescription ||
      !premiumAdditionalCosts
    ) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }
    if (gig && gig.pricing && gig.pricing.basic) {
      gig.pricing.basic.price = basicPrice as number;
      gig.pricing.basic.services = {
        includeServices: basicServices,
        duration: basicDuration,
        name: basicName,
        description: basicDescription,
      };
      gig.pricing.basic.additionalCosts = basicAdditionalCosts;
    }
    if (gig && gig.pricing && gig.pricing.standard) {
      gig.pricing.standard.price = standardPrice as number;
      gig.pricing.standard.services = {
        includeServices: standardServices,
        duration: standardDuration,
        name: standardName,
        description: standardDescription,
      };
      gig.pricing.standard.additionalCosts = standardAdditionalCosts;
    }

    if (gig && gig.pricing && gig.pricing.premium) {
      gig.pricing.premium.price = premiumPrice as number;
      gig.pricing.premium.services = {
        includeServices: premiumServices,
        duration: premiumDuration,
        name: premiumName,
        description: premiumDescription,
      };
      gig.pricing.premium.additionalCosts = premiumAdditionalCosts;
    }
    await gig.save();
    res.status(201).json({
      success: true,
      gig,
    });
  }
);

const createGigStep3 = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    const lawyer = req.user?.roles.find((role) => role.roleType === "lawyer");
    const lawyerId = lawyer?._id;
    if (!lawyerId) {
      return next(
        new ErrorHandler("You are not authorized to create a gig", 401)
      );
    }
    const gigId = req.params.id;
    const gig = await Gig.findOne({ _id: gigId });

    if (!gig) {
      return next(new ErrorHandler("Gig not found", 404));
    }
    if (gig.user.toString() !== userId.toString()) {
      return next(
        new ErrorHandler("You are not authorized to update this gig", 401)
      );
    }

    const { images } = req.body;

    if (!images) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }
    if (gig) {
      gig.images = images;
    }
    await gig.save();
    res.status(201).json({
      success: true,
      gig,
    });
  }
);

const getGigs = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const gigs = await Gig.find();
    res.status(200).json({
      success: true,
      gigs,
    });
  }
);
const getGig = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return next(new ErrorHandler("Gig not found", 404));
    }
    res.status(200).json({
      success: true,
      gig,
    });
  }
);
const updateGig = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const gig = await Gig.findByIdAndUpdate(req.params.id as string, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    if (!gig) {
      return next(new ErrorHandler("Gig not found", 404));
    }
    res.status(200).json({
      success: true,
      gig,
    });
  }
);

const deleteGig = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const gig = await Gig.findByIdAndDelete(req.params.id, {
      useFindAndModify: false,
    });
    if (!gig) {
      return next(new ErrorHandler("Gig not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Gig deleted successfully",
    });
  }
);

export {
  createGigStep1,
  createGigStep2,
  createGigStep3,
  deleteGig,
  getGig,
  getGigs,
  updateGig,
};
