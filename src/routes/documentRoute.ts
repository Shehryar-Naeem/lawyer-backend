import express from "express";

import { uploadFile } from "../controller/doumentController.js";
import { singleAvatar, attachmentsMulter } from "../middleware/multer.js";
import { isAuthenticatedUser } from "../middleware/authUser.js";

const router = express.Router();

router
  .route("/upload-document/:id")
  .post(isAuthenticatedUser, attachmentsMulter, uploadFile);

export default router;
