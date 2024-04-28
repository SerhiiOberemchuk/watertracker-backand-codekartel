import express from "express";
import authController from "../controllers/authControllers.js";
import validateBody from "../helpers/validateBody.js";
import upload from "../middlewares/upload.js";

import {
  userSignUpAndLoginSchema,
  updateUserInfoSchema,
  userEmailSchema,
  recoverPasswordSchema,
  refreshTokenSchema,
} from "../schemas/usersSchemas.js";

import authenticate from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateBody(userSignUpAndLoginSchema),
  authController.signUp
);

authRouter.post(
  "/login",
  validateBody(userSignUpAndLoginSchema),
  authController.signIn
);

authRouter.post(
  "/forgot-password",
  validateBody(userEmailSchema),
  authController.forgotPassword
);
authRouter.post(
  "/recover-password",
  validateBody(recoverPasswordSchema),
  authController.recoverPassword
);

authRouter.post(
  "/refresh",
  validateBody(refreshTokenSchema),
  authController.refresh
);
authRouter.post("/logout", authenticate, authController.logOut);

authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  authController.updateAvatar
);

authRouter.patch(
  "/update",
  authenticate,
  validateBody(updateUserInfoSchema),
  authController.updateUserInfo
);

authRouter.get("/info", authenticate, authController.getUserInfo);

authRouter.get("/google", authController.googleAuth);

authRouter.get("/google-redirect", authController.googleRedirect);

export default authRouter;
