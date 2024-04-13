import JoiBase from "joi";

const Joi = JoiBase.extend({
  type: "time",
  base: JoiBase.string(),
  messages: {
    "time.base": '"{#label}" must be a valid time',
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
  value: Joi.number().min(50).max(5000),
  time: Joi.time().required(),
});

export const updateWaterSchema = Joi.object({
  value: Joi.number().min(50).max(5000),
  time: Joi.time().required(),
});
