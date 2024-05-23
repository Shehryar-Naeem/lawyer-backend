import express from "express";
import {
  acceptBid,
  getAllBidsRelatedToPost,
  getMeAcceptedBid,
  getMebids,
  sendProposal,
} from "../controller/bids.js";
import {
  authorizeToClient,
  authorizeToLawyer,
  isAuthenticatedUser,
} from "../middleware/authUser.js";

const router = express.Router();

router
  .route("/send-proposal/:id")
  .post(isAuthenticatedUser, authorizeToLawyer, sendProposal);

router
  .route("/accept-bid/:id")
  .put(isAuthenticatedUser, authorizeToClient, acceptBid);

router.route("/get-me-bids").get(isAuthenticatedUser,authorizeToLawyer,getMebids);

router.route("/get-me-accepted-bid").get(isAuthenticatedUser,authorizeToLawyer,getMeAcceptedBid);

router
  .route("/get-post-bids/:id")
  .get(isAuthenticatedUser, authorizeToClient, getAllBidsRelatedToPost);
  

export default router;
