import express from "express";
import {
  customerSupportMessage,
  getAllCustomerSupportMessages,
} from "../controller/customerSupportController.js";
import {
  authorizeToAdmin,
  isAuthenticatedUser,
} from "../middleware/authUser.js";

const router = express.Router();

router.route("/send/message/customer-support").post(customerSupportMessage);

router
  .route("/get/messages/customer-support")
  .get(isAuthenticatedUser, authorizeToAdmin, getAllCustomerSupportMessages);

export default router;
