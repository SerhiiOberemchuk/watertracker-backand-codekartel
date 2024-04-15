import * as waterServices from "../services/waterServices.js";
import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";
import User from "../models/User.js";

const addWater = async (req, res) => {
  const { _id: user } = req.user;
  const { value } = req.body;
  const { time } = req.body;
  const result = await waterServices.addWater({
    user,
    value,
    time,
  });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const updateWater = async (req, res) => {
  const { id } = req.params;

  const { value, time } = req.body;

  const result = await waterServices.updateWaterToday(
    {
      id,
    },
    {
      value,
      time,
    }
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const deleteWater = async (req, res) => {
  const { id } = req.params;

  const result = await waterServices.deleteWater({
    id,
  });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json({
    message: `The information on the  water intake deleted successfully. `,
  });
};

const waterRateCtrl = async (req, res, next) => {
  const { amountOfWater } = req.body;

  const { _id } = req.user;
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { waterRate: amountOfWater },
    { new: true }
  );
  if (amountOfWater > 15 || amountOfWater <= 0) {
    throw HttpError(
      400,
      "The amount of water can't be more than 15l or less than 1ml"
    );
  }
  if (!updatedUser) {
    throw HttpError(404, "Not found");
  }
  res.json({ updatedUser });
};

export default {
  addWater: ctrWrapper(addWater),
  updateWater: ctrWrapper(updateWater),
  deleteWater: ctrWrapper(deleteWater),
  waterRateCtrl: ctrWrapper(waterRateCtrl),
};
