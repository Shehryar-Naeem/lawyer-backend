import express from "express";

import { createHiring, getClientHiring, getLawyerHiring, markHiringAsCompleted } from "../controller/hiringController.js";
import {
  authorizeToClient,
  authorizeToLawyer,
  isAuthenticatedUser,
} from "../middleware/authUser.js";

const router = express.Router();

router
  .route("/create-hiring/:id")
  .post(isAuthenticatedUser, authorizeToClient, createHiring);

router.route("/get-client-hiring").get(isAuthenticatedUser, authorizeToClient,getClientHiring);
router.route("/get-lawyer-hiring").get(isAuthenticatedUser, authorizeToLawyer,getLawyerHiring);
router.route("/mark-hiring-as-completed/:id").put(isAuthenticatedUser, markHiringAsCompleted);

export default router;
