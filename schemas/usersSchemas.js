import Joi from "joi";

export const userSignUpAndLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
});

export const updateUserInfoSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8).max(64),
  oldPassword: Joi.string().min(8).max(64),
  gender: Joi.string().valid("male", "female"),
  name: Joi.string().max(32),
});
