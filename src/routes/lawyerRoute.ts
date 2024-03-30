import express from "express";
import {
  authorizeToAdmin,
  authorizeToLawyer,
  isAuthenticatedUser,
} from "../middleware/authUser.js";
import {
  completeLawyer,
  createLawyer,
  deleteLawyer,
  getAllLawyers,
  getLawyerProfile,
  singalLawyer,
  verifytheLawyer,
} from "../controller/LawyerController.js";

const router = express.Router();

router.route("/create-lawyer-account").post(isAuthenticatedUser, createLawyer);
router
  .route("/complete-lawyer-profile")
  .put(isAuthenticatedUser, authorizeToLawyer, completeLawyer);
router
  .route("/get-lawyer")
  .get(isAuthenticatedUser, authorizeToLawyer, getLawyerProfile);
router
  .route("/get-lawyer/admin/:id")
  .get(isAuthenticatedUser, authorizeToAdmin, singalLawyer);
router
  .route("/verify-lawyer/:id")
  .put(isAuthenticatedUser, authorizeToAdmin, verifytheLawyer);
router
  .route("/get-lawyers")
  .get(isAuthenticatedUser, authorizeToAdmin, getAllLawyers);
router
  .route("/delete-lawyer/admin/:id")
  .delete(isAuthenticatedUser, authorizeToAdmin, deleteLawyer);



export default router;
