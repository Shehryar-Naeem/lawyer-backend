import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import {
  ApiFeatures,
  ErrorHandler,
  QueryString,
} from "../utils/utility-class.js";
import { Gig } from "../models/GigsModel/gigModel.js";
import { AuthenticatedRequest, IGig } from "../types/types.js";
import mongoose, { Types } from "mongoose";
import { Lawyer } from "../models/userModel/laywerModel.js";
import cloudinary from "cloudinary";

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

    const totalUserGigs = await Gig.find({ user: userId });

    if (!lawyerInstance) {
      return next(new ErrorHandler("Lawyer not found", 404));
    }
    if (
      lawyerInstance.gigs &&
      // lawyerInstance.gigs.length >= 2 &&
      totalUserGigs.length >= 2
    ) {
      return next(new ErrorHandler("You can only create up to two gigs", 400));
    }

    const { title, category, description } = req.body;
    if (!title || !category || !description) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }
    const appentGitTitle = `i will ${title}`;
    const gig = await Gig.create({
      title: appentGitTitle.toLowerCase(),
      category,
      description: description.toLowerCase(),
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

    const { services, price, additionalServices, basicPrice } = req.body;

    if (!services || !price) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }
    if (services.length < 1) {
      return next(new ErrorHandler("Please enter at least one service", 400));
    }
    if (gig) {
      gig.pricing = {
        services,
        price,
      };
    }
    if (additionalServices && basicPrice) {
      gig.pricing.additionalCost = {
        services: additionalServices,
        price: basicPrice,
      };
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
    try {
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

      let avatars = [];
      const { images } = req.body;

      if (!images) {
        return next(new ErrorHandler("Please enter images", 400));
      }

      if (typeof images === "string") {
        avatars.push(images);
      } else {
        avatars = images;
      }

      const imagesLinks = [];
      for (let i = 0; i < avatars.length; i++) {
        const result = await cloudinary.v2.uploader.upload(avatars[i], {
          folder: "gigs",
        });

        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      if (gig) {
        gig.images = imagesLinks;
      }
      await gig.save();

      res.status(201).json({
        success: true,
        gig,
      });
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  }
);

const getGigs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resultPerPage: number = 4;
    const gigsCount: number = await Gig.countDocuments();

    const apiFeature = new ApiFeatures<IGig>(
      Gig.find().populate({
        path: "user",
        select: "city",
      
      }),        
      req.query as any
    )
      .searchByFields()
      .filter()
      .pagination(resultPerPage);

    const gigs = await apiFeature.query; // Ensuring execution of the query

    res.status(200).json({
      success: true,
      gigs,
      gigsCount,
      filterporduct: gigs.length,
    });
  } catch (error) {
    next(error);
  }
};




// const getGigs = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userCity = req.query.city;

//     const gigs = await Gig.aggregate([
//       {
//         $lookup: {
//           from: 'users', // the collection name in the database
//           localField: 'user', // the field from the gigs collection
//           foreignField: '_id', // the corresponding field in the users collection
//           as: 'user'
//         }
//       },
//       {
//         $match: { 'user.city': userCity }
//       },
//       {
//         $unwind: '$user' // Optionally unwind if you're expecting one user per gig
//       }
//     ]);

//     if (!gigs.length) {
//       return next(new ErrorHandler("No gigs found for the specified city", 404));
//     }

//     res.status(200).json({
//       success: true,
//       count: gigs.length,
//       gigs
//     });
//   } catch (error) {
//     next(new ErrorHandler("Server error", 500));
//   }
// };

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

const getUserGigs = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    const gigs = await Gig.find({ user: userId });
    if (!gigs) {
      return next(new ErrorHandler("Gigs not found", 404));
    }
    res.status(200).json({
      success: true,
      gigs,
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
  getUserGigs,
};
