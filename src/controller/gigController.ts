import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import {
  ApiFeatures,
  ErrorHandler,
  QueryString,
} from "../utils/utility-class.js";
import { Gig } from "../models/GigsModel/gigModel.js";
import { AuthenticatedRequest, IGig } from "../types/types.js";
import { Lawyer } from "../models/userModel/laywerModel.js";
import cloudinary from "cloudinary";
import { log } from "console";
import { User } from "../models/userModel/userModel.js";

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
    if (lawyerInstance?.isVerified === false) {
      return next(new ErrorHandler("Please verify your account first", 400));
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
    const userCity = req.user?.city;
    if (userCity === null) {
      return next(new ErrorHandler("Please update your profile first", 400));
    }
    const appentGitTitle = `${title}`;
    const gig = await Gig.create({
      title: appentGitTitle.toLowerCase(),
      category,
      description: description.toLowerCase(),
      user: userId,
      lawyer: _id,
      city: userCity,
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

// const createGigStep3 = TryCatch(
//   async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     try {
//       const userId = req.user?._id as string;
//       const lawyer = req.user?.roles.find((role) => role.roleType === "lawyer");
//       const lawyerId = lawyer?._id;

//       if (!lawyerId) {
//         return next(
//           new ErrorHandler("You are not authorized to create a gig", 401)
//         );
//       }

//       const gigId = req.params.id;
//       const gig = await Gig.findOne({ _id: gigId });

//       if (!gig) {
//         return next(new ErrorHandler("Gig not found", 404));
//       }

//       if (gig.user.toString() !== userId.toString()) {
//         return next(
//           new ErrorHandler("You are not authorized to update this gig", 401)
//         );
//       }

//       let avatars = [];
//       const { images } = req.body;

//       if (!images) {
//         return next(new ErrorHandler("Please enter images", 400));
//       }

//       if (typeof images === "string") {
//         avatars.push(images);
//       } else {
//         avatars = images;
//       }

//       for (let i = 0; i < gig.images.length; i++) {
//         await cloudinary.v2.uploader.destroy(gig.images[i].public_id);
//       }

//       const imagesLinks = [];
//       for (let i = 0; i < avatars.length; i++) {
//         const result = await cloudinary.v2.uploader.upload(avatars[i], {
//           folder: "gigs",
//         });
//         console.log(result.secure_url);

//         imagesLinks.push({
//           public_id: result.public_id,
//           url: result.secure_url,
//         });
//       }

//       if (gig) {
//         gig.images = imagesLinks;
//       }
//       await gig.save();

//       res.status(201).json({
//         success: true,
//         gig,
//       });
//     } catch (error) {
//       next(error); // Pass the error to the error handling middleware
//     }
//   }
// );

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

const getGigs = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const resultPerPage: number = 10;
    const gigsCount: number = await Gig.countDocuments();

    const apiFeature = new ApiFeatures(
      Gig.find().populate({
        path: "user",
        select: "city avatar",
      }),
      req.query as any
    )
      .searchByFields()
      .filter()
      .pagination(resultPerPage);

    const gigs = await apiFeature.query;

    res.status(200).json({
      success: true,
      gigs: gigs,
      resultPerPage,
      gigsCount,
      filterGigCount: gigs.length,
    });
  }
);

// const getGigs = TryCatch(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const resultPerPage: number = 2;

//     const apiFeature = new ApiFeatures(
//       Gig.find().populate({
//         path: "user",
//         select: "city avatar",
//       }),
//       req.query as any
//     )
//       .searchByFields()
//       .filter()
//       .pagination(resultPerPage);

//       const gigsCount = await apiFeature.query.clone().countDocuments();

//       const gigs = await apiFeature.query.exec();

//     res.status(200).json({
//       success: true,

//       gigs: gigs.reverse(),
//       resultPerPage,
//       gigsCount,
//       filterGigCount: gigs.length,

//     });
//   }
// );

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
    try {
      const gig = await Gig.findById(req.params.id.toString())
        .populate("user", "-password") // Populate the 'user' field, excluding password
        .populate("lawyer") // Populate the 'lawyer' field
        .populate("reviews.user", "name avatar");

      if (!gig) {
        return next(new ErrorHandler("Gig not found", 404));
      }

      res.status(200).json({
        success: true,
        gig,
      });
    } catch (error) {
      // Handle any errors
      return next(error);
    }
  }
);

const getGigById = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const gig = await Gig.findById({ _id: req.params.id.toString() });

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
    const gigs = await Gig.find({ user: userId })
      .populate("user", "-password") // Populate the 'user' field, excluding password
      .populate("lawyer");

    if (!gigs) {
      return next(new ErrorHandler("Gigs not found", 404));
    }
    res.status(200).json({
      success: true,
      gigs: gigs.reverse(),
    });
  }
);

// const updateGig = TryCatch(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const gig = await Gig.findByIdAndUpdate(req.params.id as string, req.body, {
//       new: true,
//       runValidators: true,
//       useFindAndModify: false,
//     });
//     if (!gig) {
//       return next(new ErrorHandler("Gig not found", 404));
//     }
//     res.status(200).json({
//       success: true,
//       gig,
//     });
//   }
// );

const updateGig = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const gig = await Gig.findById({
      _id: req.params.id.toString(),
    });

    if (!gig) {
      return next(new ErrorHandler("Gig not found", 404));
    }

    const { title, category, description } = req.body;

    if (title) {
      gig.title = title;
    }
    if (category) {
      gig.category = category;
    }
    if (description) {
      gig.description = description;
    }

    await gig.save();

    res.status(200).json({
      success: true,
      gig,
    });
  }
);

const deleteGig = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const gig = await Gig.findByIdAndDelete(
      {
        _id: req.params.id.toString(),
      },
      {
        useFindAndModify: false,
      }
    );

    if (!gig) {
      return next(new ErrorHandler("Gig not found", 404));
    }

    const lawyer: any = await Lawyer.findById({
      _id: gig.lawyer.toString(),
    });

    if (lawyer) {
      const gigs = lawyer.gigs.filter(
        (gigId: any) => gigId.toString() !== req.params.id.toString()
      );
      lawyer.gigs = gigs;
      await lawyer.save();
    }
    res.status(200).json({
      success: true,
      message: "Gig deleted successfully",
    });
  }
);

const addReview = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { rating, comment } = req.body;

    const gig: any = await Gig.findById(req.params.id);

    if (!gig) {
      return next(new ErrorHandler("Gig not found", 404));
    }
    if (gig.user.toString() === req.user?._id.toString()) {
      return next(new ErrorHandler("You can't review this gig", 400));
    }
    const alreadyReviewed = gig.reviews.find(
      (r: any) => r.user.toString() === req.user?._id.toString()
    );
    if (alreadyReviewed) {
      gig.reviews.forEach((review: any) => {
        if (review.user.toString() === req.user?._id.toString()) {
          review.rating = rating;
          review.comment = comment;
        }
      });
    } else {
      const review: any = {
        rating: Number(rating),
        comment,
        user: req.user?._id,
      };
      gig.reviews.push(review);
      gig.numOfReviews = gig.reviews.length;
    }

    let avg = 0;
    gig.reviews.forEach((review: any) => {
      avg += review.rating;
    });

    gig.ratings = avg / gig.reviews.length;

    await gig.save({ validateBeforeSave: false });

    // if (alreadyReviewed) {
    //   return next(new ErrorHandler("You have already reviewed this gig", 400));
    // }

    // const review:any= {
    //   rating: Number(rating),
    //   comment,
    //   user: req.user?._id,
    // };

    // gig.reviews.push(review);

    // gig.numOfReviews = gig.reviews.length;

    // gig.ratings =
    //   gig.reviews.reduce((acc:any, item:any) => item.rating + acc, 0) /
    //   gig.reviews.length;

    // await gig.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Review added successfully",
    });
  }
);

const getGigReviews = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const gig = await Gig.findById({
      _id: req.params.id.toString(),
    })
    .populate("reviews.user", "name avatar")
    .exec();

    if (!gig) {
      return next(new ErrorHandler("Gig not found", 404));
    }

    res.status(200).json({
      success: true,
      reviews: gig.reviews.reverse(),
    });
  }
);

const deleteGigReview = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const gig: any = await Gig.findById(req.params.id);
    if (!gig) {
      return next(new ErrorHandler("Gig not found", 404));
    }

    const reviews: any = gig.reviews.filter(
      (review: any) => review._id.toString() !== req.params.reviewId.toString()
    );

    const numOfReviews = reviews.length;

    let ratings = 0;

    reviews.forEach((review: any) => {
      ratings += review.rating;
    });

    gig.reviews = reviews;

    gig.numOfReviews = numOfReviews;
    gig.ratings = ratings / reviews.length;

    await gig.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  }
);

const getAllGigs = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const gigs = await Gig.find();

    res.status(200).json({
      success: true,
      gigs,
    });
  }
);

const updateGigByAdmin = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const gig = await Gig.findById({
      _id: req.params.id.toString(),
    });

    if (!gig) {
      return next(new ErrorHandler("Gig not found", 404));
    }

    const { title, category, description, services, price, images } = req.body;

    if (title) {
      gig.title = title;
    }
    if (category) {
      gig.category = category;
    }
    if (description) {
      gig.description = description;
    }
    if (services) {
      gig.pricing.services = services;
    }
    if (price) {
      gig.pricing.price = price;
    }
    if (images !== null || images !== undefined || images.length > 0) {
      let avatars = [];

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

      gig.images = imagesLinks;
    }
    await gig.save();

    res.status(200).json({
      success: true,
      gig,
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
  getGigById,
  addReview,
  getGigReviews,
  deleteGigReview,
  getAllGigs,
  updateGigByAdmin,
};
