import Joi from "joi";

export const userSignUpAndLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
});

export const updateUserInfoSchema = Joi.object({
  email: Joi.string().email(),
  oldPassword: Joi.string().min(8).max(64),
  newPassword: Joi.string().min(8).max(64),
  gender: Joi.string().valid("male", "female"),
  name: Joi.string().max(32),
});

export const userEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).max(16).required(),
  token: Joi.string().required(),
});

export const recoverPasswordSchema = Joi.object({
  password: Joi.string().min(8).max(16).required(),
  token: Joi.string().required(),
});
