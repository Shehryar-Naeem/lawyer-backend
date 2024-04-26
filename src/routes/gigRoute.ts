import express from "express";
import {
  authorizeToAdmin,
  authorizeToLawyer,
  isAuthenticatedUser,
} from "../middleware/authUser.js";
import {
  createGigStep1,
  createGigStep2,
  createGigStep3,
  deleteGig,
  getGig,
  getGigById,
  getGigs,
  getUserGigs,
} from "../controller/gigController.js";

const router = express.Router();
router
  .route("/create-gig/step-1")
  .post(isAuthenticatedUser, authorizeToLawyer, createGigStep1);
router
  .route("/create-gig/step-2/:id")
  .put(isAuthenticatedUser, authorizeToLawyer, createGigStep2);
router
  .route("/create-gig/step-3/:id")
  .put(isAuthenticatedUser, authorizeToLawyer, createGigStep3);
router
  .route("/delete-gig/:id")
  .delete(isAuthenticatedUser, authorizeToAdmin, deleteGig);
router
  .route("/get-gig/:id")
  .get(isAuthenticatedUser, getGig);
router.route("/get-gig-by-id/:id").get(isAuthenticatedUser, authorizeToLawyer,getGigById);
router.route("/get-gigs/me").get(isAuthenticatedUser, authorizeToLawyer, getUserGigs);
router.route("/get-gigs").get(getGigs);

export default router;
