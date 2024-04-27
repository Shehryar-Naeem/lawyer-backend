import express from "express";

import {
    deleteMessage,
  getSingleConversationMessages,
  sendMessage,
} from "../controller/messageController.js";
import { isAuthenticatedUser } from "../middleware/authUser.js";

const router = express.Router();

router.route("/send-message/:id").post(isAuthenticatedUser, sendMessage);
router
  .route("/get-single-conversation-messages/:id")
  .get(isAuthenticatedUser, getSingleConversationMessages);
router.route("/delete-message/:id").delete(isAuthenticatedUser, deleteMessage);

export default router;
