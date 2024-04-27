import express from "express";
import { isAuthenticatedUser } from "../middleware/authUser.js";
import {
  createConversation,
  deleteConversation,
  getMeConversations,
} from "../controller/conversation.js";

const router = express.Router();

router
  .route("/create-conversation")
  .post(isAuthenticatedUser, createConversation);

router.route("/me/conversation").get(isAuthenticatedUser, getMeConversations);
router
  .route("delete-conversation/:id")
  .delete(isAuthenticatedUser, deleteConversation);

export default router;
