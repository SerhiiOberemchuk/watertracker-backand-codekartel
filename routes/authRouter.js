import express from "express";
import authController from "../controllers/authControllers.js";
import validateBody from "../helpers/validateBody.js";
import upload from "../middlewares/upload.js";

import {
  userSignUpAndLoginSchema,
  updateUserInfoSchema,
} from "../schemas/usersSchemas.js";

import authenticate from "../middlewares/authenticate.js";
import isValidId from "../middlewares/isValidId.js";

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

export default authRouter;
