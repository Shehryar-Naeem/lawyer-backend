import express from "express";
import {
  authorizeToAdmin,
  authorizeToLawyer,
  isAuthenticatedUser,
} from "../middleware/authUser.js";
import {
  addReview,
  createGigStep1,
  createGigStep2,
  createGigStep3,
  deleteGig,
  deleteGigReview,
  getGig,
  getGigById,
  getGigReviews,
  getGigs,
  getUserGigs,
  updateGig,
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
  .delete(isAuthenticatedUser, authorizeToLawyer, deleteGig);
  router.route("/update-gig/:id").put(isAuthenticatedUser, authorizeToLawyer, updateGig);
router
  .route("/get-gig/:id")
  .get(isAuthenticatedUser, getGig);
  router.route("/add/review/:id").put(isAuthenticatedUser,addReview)
  router.route("/gig-reviews/:id").get(isAuthenticatedUser,getGigReviews)
  router.route("/delete/gig-rating/:id").get(isAuthenticatedUser,deleteGigReview)
router.route("/get-gig-detail/:id").get(isAuthenticatedUser, authorizeToLawyer,getGigById);
router.route("/get-gigs/me").get(isAuthenticatedUser, authorizeToLawyer, getUserGigs);
router.route("/get-gigs").get(getGigs);
router.route("/delete/gig-rating/:id/:reviewId").delete(isAuthenticatedUser,deleteGigReview)

export default router;
