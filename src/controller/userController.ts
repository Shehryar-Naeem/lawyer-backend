import { NextFunction, Request, Response } from "express";
import {
  AuthenticatedRequest,
  CombinedType,
  IUpdateUser,
  IUser,
  NewUserRequestBody,
  updateAuthenticatedRequest,
} from "../types/types.js";
import sendMail from "../utils/sendMail.js";
import { User } from "../models/userModel/userModel.js";
import { TryCatch } from "../middleware/error.js";
import { ErrorHandler } from "../utils/utility-class.js";
import sendToken from "../utils/jwtToken.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
import { Gig } from "../models/GigsModel/gigModel.js";

const CreateUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, password } = req.body;

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const msg: string = "user Register Successfully";

    sendToken(newUser as CombinedType, 201, res, msg);
  }
);

const loginUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email & password", 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
    let redirectUrl;
    const roles = user.roles.map((role) => role.roleType);

    if (roles.includes("admin")) {
      redirectUrl = "admin";
    } else if (roles.includes("lawyer")) {
      redirectUrl = "lawyer";
    } else if (roles.includes("client")) {
      redirectUrl = "client";
    }

    const msg: string = "user login Successfully";

    sendToken(user as CombinedType, 200, res, msg, redirectUrl);
  }
);

// const completeLawyerProfile = TryCatch(
//   async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     const id = req.user?._id;
//     const user = await User.findOne({ _id: id }).select("+password");
//     if (!user) {
//       return next(new ErrorHandler("user not found", 404));
//     }
//     if (user.role === "lawyer") {
//       const {
//         designation,
//         experience,
//         education,
//         phone,
//         yourSelf,
//         address,
//         cnic,
//         gender,
//         dob,
//       } = req.body;
//       if (
//         !designation ||
//         !experience ||
//         !education ||
//         !phone ||
//         !yourSelf ||
//         !address ||
//         !cnic ||
//         !gender ||
//         !dob
//       ) {
//         return next(new ErrorHandler("Please fill all the fields", 404));
//       }
//       const dobDate = new Date(dob);

//       const lawyer = await Laywer.create({
//         user: user._id,
//         designation,
//         experience,
//         education,
//         phone,
//         yourSelf,
//         address,
//         cnic,
//         gender,
//         dob: dobDate,
//       });
//       return res.status(201).json({
//         success: true,
//         message: "profle created Successfully",
//         lawyer,
//       });
//     } else if (user.role === "client") {
//       const {
//         phone,
//         yourSelf,
//         address,
//         cnic,

//         gender,
//         age,
//       } = req.body;
//       if (!phone || !yourSelf || !address || !cnic || !gender || !age) {
//         return next(new ErrorHandler("Please fill all the fields", 404));
//       }

//       const client = await Client.create({
//         user: user._id,
//         phone,
//         yourSelf,
//         address,
//         cnic,
//         gender,
//         age,
//       });
//       return res.status(201).json({
//         success: true,
//         message: "profle created Successfully",
//         client,
//       });
//     } else {
//       return next(new ErrorHandler("user not found", 404));
//     }
//   }
// );

const getProfleData = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let isProfileComplete = false;
    const id = req.user?._id;
    const user = await User.findById({ _id: id });
    if (!user) {
      return next(new ErrorHandler("user not found", 404));
    }
    if (
      user.email === null ||
      user.name === null ||
      user.city == null ||
      user.yourSelf === null ||
      user.gender === null ||
      user.postalCode === null
    ) {
      isProfileComplete = true;
    }
    res.status(200).json({
      success: true,
      message: "profle Successfully fetched",
      user,
      isProfileComplete,
    });
  }
);

const logout = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "user logout successfully",
    });
  }
);

const updateProfile = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;

    try {
      let updatedFields = req.body;

      // Convert email to lowercase if it exists in the request body
      if (updatedFields.email) {
        updatedFields.email = updatedFields.email.toLowerCase();
      }
      if (updatedFields.city) {
        const user: any = req.user?._id;

        const userGigs: any = await Gig.find({ user: user.toString() });
        
        if (userGigs.length > 0) {
          userGigs.map(async (gig: any) => {
            gig.city = updatedFields.city;
            await gig.save();
          });
        }
        
        
        
        updatedFields.city = updatedFields.city.toLowerCase();
      }

      // Find the user by ID and update the fields
      const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
        new: true, // Return the updated document
        runValidators: true, // Run validators to ensure data consistency
      });

      if (!updatedUser) {
        return next(new ErrorHandler("User not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      // Handle errors, log, and/or return appropriate responses
      console.error(error);
      next(error);
    }
  }
);

const updateProfilePicture = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    try {
      let user = await User.findById(userId);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      if (req.body.avatar !== "") {
        const imageId = user?.avatar?.public_id;

        // If the user already has a profile picture, delete it from Cloudinary
        if (imageId) {
          await cloudinary.v2.uploader.destroy(imageId);
        }

        // Upload the new profile picture to Cloudinary
        const uploadedImage = await cloudinary.v2.uploader.upload(
          req.body.avatar,
          {
            folder: "avatars",
            width: 150,
            crop: "scale",
          }
        );

        // Update the user's avatar information with the new Cloudinary data
        user.avatar = {
          public_id: uploadedImage.public_id,
          url: uploadedImage.secure_url,
        };

        // Save the updated user information
        user = await user.save();
      }

      res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        user,
      });
    } catch (error) {
      return next(new ErrorHandler("Failed to update profile picture", 500));
    }
  }
);

const forgetPassword = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const liveUrl = "https://lawyer-market.vercel.app/";
    const resetUrl = `${
      process.env.FRONTEND_URL || liveUrl
    }user/resetpassword/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;
    try {
      await sendMail(user.email, "Password reset token", message);
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorHandler("Email could not be sent", 500));
    }
  }
);

const restPassword = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorHandler("Invalid token", 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not match", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  }
);

const updatePasswrord = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?._id).select("+password");
    const isMatch = await user?.comparePassword(req.body.oldPassword);
    if (!isMatch) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("password does not match", 400));
    }
    user!.password = req.body.newPassword;

    await user!.save();
    const msg: string = "Password updated successfully";
    sendToken(user as CombinedType, 200, res, msg);
  }
);

const getAllUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();
    const totalUserLength = await User.countDocuments();
    res.status(200).json({
      success: true,
      message: "All User",
      users,
      totaluser: totalUserLength,
    });
  }
);

const updateProfileByadmin = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const user = await User.findOne({ _id: id });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const updatedFields = req.body;

    Object.keys(updatedFields).forEach((key) => {
      // Use type assertion here if necessary
      (user as any)[key] = updatedFields[key];
    });

    // Save the updated user
    await user.save();
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  }
);

const deleteUserByAdmin = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const user = await User.findOne({ _id: id });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  }
);

export {
  CreateUser,
  loginUser,
  getProfleData,
  logout,
  updateProfile,
  getAllUser,
  deleteUserByAdmin,
  updateProfileByadmin,
  forgetPassword,
  restPassword,
  updatePasswrord,
  updateProfilePicture,
};
