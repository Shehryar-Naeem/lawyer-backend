import express from "express";
import {
  authorizeToAdmin,
  authorizeToClient,
  authorizeToLawyer,
  isAuthenticatedUser,
} from "../middleware/authUser.js";
import {
  completeThePostStatus,
  creatPost,
  deletePost,
  getAllJobs,
  getAllJobsByAdmin,
  getJobByIdByAdmin,
  getMeHiredJobs,
  getMePosts,
  getPost,
  getPostStatusToAllowReviewToClient,
  getPostWhoStatusIsHired,
  updateJobByAdmin,
  updatePost,
  updateStopRecievingRequest,
  updateThePostStatus,
} from "../controller/clientPost.js";

const router = express.Router();

router
  .route("/create-job")
  .post(isAuthenticatedUser, authorizeToClient, creatPost);
router
  .route("/stop-recieving-request/:id")
  .put(isAuthenticatedUser, authorizeToClient, updateStopRecievingRequest);
router
  .route("/update-job/:id")
  .put(isAuthenticatedUser, authorizeToClient, updatePost);
router
  .route("/get-me-jobs")
  .get(isAuthenticatedUser, authorizeToClient, getMePosts);
router
  .route("/get-job/:id")
  .get(isAuthenticatedUser, authorizeToClient, getPost);
router
  .route("/update-job-status/:id")
  .put(isAuthenticatedUser, updateThePostStatus);
router
  .route("/me/hired-jobs")
  .get(isAuthenticatedUser, authorizeToClient, getPostWhoStatusIsHired);
router
  .route("/delete-job/:id")
  .delete(isAuthenticatedUser, authorizeToClient, deletePost);
router.route("/get-all-jobs").get(getAllJobs);
router
  .route("/get-jobs/admin")
  .get(isAuthenticatedUser, authorizeToAdmin, getAllJobsByAdmin);
router
  .route("/update-job/admin/:id")
  .put(isAuthenticatedUser, authorizeToAdmin, updateJobByAdmin);
router
  .route("/delete-job/admin/:id")
  .delete(isAuthenticatedUser, authorizeToAdmin, deletePost);
router
  .route("/get-job/admin/:id")
  .get(isAuthenticatedUser, authorizeToAdmin, getJobByIdByAdmin);
router
  .route("/me/lawyer-active-jobs")
  .get(isAuthenticatedUser, authorizeToLawyer, getMeHiredJobs);

router
  .route("/allow-review/:id")
  .get(
    isAuthenticatedUser,
    authorizeToClient,
    getPostStatusToAllowReviewToClient
  );

router
  .route("/complete-job/:id")
  .put(isAuthenticatedUser, completeThePostStatus);
export default router;
