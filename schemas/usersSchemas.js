import Joi from "joi";
import { emailRegexp } from "../constans/user-constans.js";

export const userSignUpAndLoginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().empty(false).messages({
    "string.base": "The email must be a string.",
    "any.required": "The email field is required.",
    "string.empty": "The email must not be empty.",
    "string.pattern.base": "The email must be in format test@gmail.com.",
  }),
  password: Joi.string().min(8).max(64).required(),
});

export const updateUserInfoSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().empty(false).messages({
    "string.base": "The email must be a string.",
    "any.required": "The email field is required.",
    "string.empty": "The email must not be empty.",
    "string.pattern.base": "The email must be in format test@gmail.com.",
  }),
  oldPassword: Joi.string().min(8).max(64),
  newPassword: Joi.string().min(8).max(64),
  gender: Joi.string().valid("male", "female"),
  name: Joi.string().max(32),
});

export const userEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().empty(false).messages({
    "string.base": "The email must be a string.",
    "any.required": "The email field is required.",
    "string.empty": "The email must not be empty.",
    "string.pattern.base": "The email must be in format test@gmail.com.",
  }),
});

export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).max(16).required(),
  token: Joi.string().required(),
});

export const recoverPasswordSchema = Joi.object({
  password: Joi.string().min(8).max(16).required(),
  token: Joi.string().required(),
});
