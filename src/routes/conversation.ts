import express from "express";
import { isAuthenticatedUser } from "../middleware/authUser.js";
import {
  createConversation,
  deleteConversation,
  getMeConversations,
  getSingleConversation,
} from "../controller/conversation.js";

const router = express.Router();

router
  .route("/create-conversation")
  .post(isAuthenticatedUser, createConversation);

router.route("/me/conversation").get(isAuthenticatedUser, getMeConversations);
router
  .route("delete-conversation/:id")
  .delete(isAuthenticatedUser, deleteConversation);

  router.route("/get-single-conversation/:id").get(isAuthenticatedUser, getSingleConversation);

export default router;
