import Joi from "joi";

export const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
export const emailValidation = Joi.string()
  .pattern(emailRegexp)
  .empty(false)
  .messages({
    "string.base": "The email must be a string.",
    "any.required": "The email field is required.",
    "string.empty": "The email must not be empty.",
    "string.pattern.base": "The email must be in format test@gmail.com.",
  });
