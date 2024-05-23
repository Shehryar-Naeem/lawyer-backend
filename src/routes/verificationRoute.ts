import express from "express";
import {
  authorizeToAdmin,
  authorizeToLawyer,
  isAuthenticatedUser,
} from "../middleware/authUser.js";
import {
  deleteRequest,
  getVerificationRequest,
  getVerificationRequests,
  sendVerifcationRequestToAdmin,
  verifyLawyer,
} from "../controller/lawyerVerfication.js";

const router = express.Router();

router
  .route("/send-verification-request")
  .post(isAuthenticatedUser, authorizeToLawyer, sendVerifcationRequestToAdmin);
router
  .route("/get-verification-requests/admin")
  .get(isAuthenticatedUser, authorizeToAdmin, getVerificationRequests);
router
  .route("/verify-lawyer/admin/:id")
  .put(isAuthenticatedUser, authorizeToAdmin, verifyLawyer);

router
  .route("/delete-request/admin/:id")
  .delete(isAuthenticatedUser, authorizeToAdmin, deleteRequest);

router
  .route(`/get-verification-request/admin/:id`)
  .get(isAuthenticatedUser, authorizeToAdmin, getVerificationRequest);

export default router;
