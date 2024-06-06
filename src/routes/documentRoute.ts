import express from "express";

import {
  deleteDocument,
  findHiringPost,
  getAllDocumentsRelatedToPost,
  uploadFile,
} from "../controller/doumentController.js";
import { singleAvatar, attachmentsMulter } from "../middleware/multer.js";
import { isAuthenticatedUser } from "../middleware/authUser.js";

const router = express.Router();

// router
//   .route("/upload-document/:id")
//   .post(isAuthenticatedUser, uploadFile);
router
  .route("/upload-document/:id")
  .post(isAuthenticatedUser, attachmentsMulter, uploadFile);

router
  .route("/get/all/post-document/:id")
  .get(isAuthenticatedUser, getAllDocumentsRelatedToPost);
router
  .route("/delete/document/:id")
  .delete(isAuthenticatedUser, deleteDocument);

router.route("/find/hiring-post/:id").get(isAuthenticatedUser, findHiringPost);

export default router;
