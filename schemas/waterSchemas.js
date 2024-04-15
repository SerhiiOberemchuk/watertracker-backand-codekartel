import JoiBase from "joi";

const Joi = JoiBase.extend({
  type: "time",
  base: JoiBase.string(),
  messages: {
    "time.base": "Please enter time in the format of HH:MM",
  },
  rules: {
    base: {
      validate(value, helpers) {
        const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timePattern.test(value)) {
          return helpers.error("time.base");
        }
        return value;
      },
    },
  },
});

export const addWaterSchema = Joi.object({
  value: Joi.number().min(50).max(5000).messages({
    "number.base": '"value" must be a number',
    "number.min": '"value" must be at least {#limit}',
    "number.max": '"value" must be less than or equal to {#limit}',
  }),
  time: Joi.time().base().required(),
});

export const updateWaterSchema = Joi.object({
  value: Joi.number().messages({
    "number.base": '"value" must be a number',
  }),
  time: Joi.time().base().required(),
});
export const waterRateSchema = Joi.object({
  amountOfWater: Joi.number().min(0.1).max(15).required(),
});
