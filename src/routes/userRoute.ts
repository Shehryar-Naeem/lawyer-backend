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
  addNewRoleToUser,
  removeAdminRole,
  getAllUserWhoRoleIsAdmin,
  getUserProfileDetailByAdmin,
  updateProfileByadmin,
  updateProfilePictureByAdmin,
  removeRoletoOurProfile,
  stats,
  // completeLawyerProfile,
} from "../controller/userController.js";
import {
  authorizeToAdmin,
  //  authorizeRoles,
  isAuthenticatedUser,
} from "../middleware/authUser.js";

const router = express.Router();

router.route("/login-or-register").post(CreateUser);
router.route("/login-user").post(loginUser);
router.route("/passwor/forget").post(forgetPassword);
router.route("/password/reset/:token").put(restPassword);
router.route("/logout").get(isAuthenticatedUser, logout);
router
  .route("/update-profile-pic")
  .put(isAuthenticatedUser, updateProfilePicture);
router.route("/get-profile").get(isAuthenticatedUser, getProfleData);
router.route("/update-user-password").put(isAuthenticatedUser, updatePasswrord);
router.route("/update-login-detail").put(isAuthenticatedUser, updateProfile);
router
  .route("/add-new-role/:id")
  .put(isAuthenticatedUser, authorizeToAdmin, addNewRoleToUser);
router
  .route("/remove-role/:id")
  .put(isAuthenticatedUser, authorizeToAdmin, removeAdminRole);
router
  .route("/get-admin-users")
  .get(isAuthenticatedUser, authorizeToAdmin, getAllUserWhoRoleIsAdmin);

router
  .route("/get-all-users/admin")
  .get(isAuthenticatedUser, authorizeToAdmin, getAllUser);

router
  .route("/get-user/admin/:id")
  .get(isAuthenticatedUser, authorizeToAdmin, getUserProfileDetailByAdmin);
router
  .route("/update-user/admin/:id")
  .put(isAuthenticatedUser, authorizeToAdmin, updateProfileByadmin);
router
  .route("/update-pic/admin/:id")
  .put(isAuthenticatedUser, authorizeToAdmin, updateProfilePictureByAdmin);
router
  .route("/delete/me-role")
  .put(isAuthenticatedUser, removeRoletoOurProfile);
router
  .route("/delete-user/admin/:id")
  .delete(isAuthenticatedUser, authorizeToAdmin, deleteUserByAdmin);
router.route("/stats/admin").get(isAuthenticatedUser, authorizeToAdmin, stats);

// // router.route("/save-profle").post(isAuthenticatedUser, completeLawyerProfile);
// router
//   .route("/get-all-users-by-admin")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);
// router
//   .route("/delete-user-by-admin")
//   .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUserByAdmin);

export default router;
