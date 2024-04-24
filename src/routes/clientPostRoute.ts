import express from "express"
import { authorizeToClient, isAuthenticatedUser } from "../middleware/authUser.js";
import { creatPost } from "../controller/clientPost.js";

const router = express.Router();

router.route("/create-client-post").post(isAuthenticatedUser,authorizeToClient,creatPost)

export default router;
