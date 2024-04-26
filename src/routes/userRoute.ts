import express from "express";
import {
  CreateUser,
  forgetPassword,
  getProfleData,
  loginUser,
  logout,
  restPassword,
  updatePasswrord,
  updateProfile,
  getAllUser,
  deleteUserByAdmin,
  updateProfilePicture,
  // completeLawyerProfile,
} from "../controller/userController.js";
import {
  //  authorizeRoles,
  isAuthenticatedUser,
} from "../middleware/authUser.js";

const router = express.Router();

router.route("/login-or-register").post(CreateUser);
router.route("/login-user").post(loginUser);
router.route("/passwor/forget").post(forgetPassword);
router.route("/password/reset/:token").put(restPassword);
router.route("/logout").get(isAuthenticatedUser, logout);
router.route("/update-profile-pic").put(isAuthenticatedUser, updateProfilePicture);
router.route("/get-profile").get(isAuthenticatedUser, getProfleData);
router.route("/update-user-password").put(isAuthenticatedUser, updatePasswrord);
router.route("/update-login-detail").put(isAuthenticatedUser, updateProfile);

// // router.route("/save-profle").post(isAuthenticatedUser, completeLawyerProfile);
// router
//   .route("/get-all-users-by-admin")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);
// router
//   .route("/delete-user-by-admin")
//   .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUserByAdmin);

export default router;

