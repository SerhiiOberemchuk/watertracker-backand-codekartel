import Joi from "joi";
import { emailValidation } from "../constans/user-constans.js";

export const userSignUpAndLoginSchema = Joi.object({
  email: emailValidation.required(),
  password: Joi.string().min(8).max(16).required(),
});

export const updateUserInfoSchema = Joi.object({
  email: emailValidation,
  oldPassword: Joi.string().min(8).max(16).when("newPassword", {
    is: Joi.exist(),
    then: Joi.required(),
  }),
  newPassword: Joi.string().min(8).max(16),
  gender: Joi.string().valid("male", "female"),
  name: Joi.string().max(32),
});

export const userEmailSchema = Joi.object({
  email: emailValidation.required(),
});

export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).max(16).required(),
  token: Joi.string().required(),
});

export const recoverPasswordSchema = Joi.object({
  password: Joi.string().min(8).max(16).required(),
  token: Joi.string().required(),
});
