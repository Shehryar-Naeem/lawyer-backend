import { NextFunction, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import LawyerVerificationRequest from "../models/LawyerVerfiicationRequest/index.js";
import { Lawyer } from "../models/userModel/laywerModel.js";
import { User } from "../models/userModel/userModel.js";
import { AuthenticatedRequest } from "../types/types.js";
import { ErrorHandler } from "../utils/utility-class.js";
import { sendMailToAdmin } from "../utils/sendMail.js";

const sendVerifcationRequestToAdmin = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id.toString();
    const user: any = await User.findOne({ _id: userId });
    if (!user) {
      return next(new ErrorHandler("user not found", 404));
    }
    const hasLawyerRole = user.roles.some(
      (role: any) => role.roleType === "lawyer"
    );
    if (!hasLawyerRole) {
      return next(new ErrorHandler("User is not a lawyer", 400));
    }
    const lawyerId: any = user.roles.find(
      (role: any) => role.roleType === "lawyer"
    )._id;

    const lawyer: any = await Lawyer.findOne({ _id: lawyerId });
    if (
      !lawyer?.professionalInfo?.lawFirmName ||
      !lawyer?.professionalInfo.title ||
      !lawyer?.professionalInfo.barAdmission.state ||
      !lawyer?.professionalInfo.barAdmission.licenseNumber ||
      !lawyer?.professionalInfo.experience ||
      !lawyer.availability.days ||
      !lawyer.education.completionYear.startYear ||
      !lawyer.education.completionYear.endYear ||
      !lawyer.education.institution ||
      !lawyer.education.degreeName ||
      !lawyer.cnicPicture.url ||
      !lawyer.lawyerIdCard.url 
    ) {
      return next(
        new ErrorHandler(
          "Please complete your profile to send verification request",
          400
        )
      );
    }

    if (!lawyer) {
      return next(new ErrorHandler("Lawyer not found", 404));
    }

    if (lawyer.isVerified) {
      return next(new ErrorHandler("Lawyer already verified", 400));
    }

    const requestExists = await LawyerVerificationRequest.findOne({
      user: userId,
      lawyer: lawyerId,
    });
    if (requestExists) {
      return next(new ErrorHandler("Request already sent", 400));
    }

    const verificationRequest = new LawyerVerificationRequest({
      user: userId,
      lawyer: lawyerId,
    });

    await verificationRequest.save();
    await sendMailToAdmin(
      user.email,
      "Lawyer Verification Request",
      `Lawyer with email ${user.email} has requested for verification`
    );
    res.status(201).json({
      success: true,
      message: "Verification Request sent successfully",
    });
  }
);

const getVerificationRequests = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const request = await LawyerVerificationRequest.find({ status: "pending" })
      .populate("user", "name email avatar")
      .populate("lawyer");
    res.status(200).json({
      success: true,
      message: request,
    });
  }
);

const getVerificationRequest = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const request = await LawyerVerificationRequest.findById({
      _id: id.toString(),
    })
      .populate("user")
      .populate("lawyer");
    if (!request) {
      return next(new ErrorHandler("Request not found", 404));
    }
    res.status(200).json({
      success: true,
      request: request,
    });
  }
);

const verifyLawyer = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;
    const request = await LawyerVerificationRequest.findById({
      _id: id.toString(),
    });
    if (!request) {
      return next(new ErrorHandler("Request not found", 404));
    }
    if (request.status !== "pending") {
      return next(new ErrorHandler("Request already processed", 400));
    }
    if (status === "approved") {
      const lawyer: any = await Lawyer.findOne({ _id: request.lawyer });
      if (!lawyer) {
        return next(new ErrorHandler("Lawyer not found", 404));
      }
      if (lawyer.isVerified) {
        return next(new ErrorHandler("Lawyer already verified", 400));
      }
      lawyer.isVerified = true;
      await lawyer.save();
      request.status = status;
    } else if (status === "rejected") {
      const lawyer: any = await Lawyer.findOne({ _id: request.lawyer });
      if (!lawyer) {
        return next(new ErrorHandler("Lawyer not found", 404));
      }
      if (!lawyer.isVerified) {
        return next(new ErrorHandler("Lawyer already unverified", 400));
      }
      lawyer.isVerified = false;
      await lawyer.save();
      request.status = status;
    } else {
      return next(new ErrorHandler("Invalid status", 400));
    }

    await request.save();
    res.status(200).json({
      success: true,
      message: "Request updated successfully",
    });
  }
);

const deleteRequest = TryCatch(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const request = await LawyerVerificationRequest.findByIdAndDelete({
      _id: id.toString(),
    });
    if (!request) {
      return next(new ErrorHandler("Request not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Request deleted successfully",
    });
  }
);

export {
  sendVerifcationRequestToAdmin,
  getVerificationRequests,
  verifyLawyer,
  deleteRequest,
  getVerificationRequest,
};
