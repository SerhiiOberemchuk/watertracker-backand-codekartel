import * as waterServices from "../services/waterServices.js";
import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";

const addWater = async (req, res) => {
  const { _id: userId } = req.user;
  const { value } = req.body;
  const { time } = req.body;
  const result = await waterServices.addWater({
    userId,
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

  const { value, date } = req.body;

  const result = await waterServices.updateWaterToday(
    {
      _id: id,
    },
    {
      value,
      date,
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
    _id: id,
  });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json({
    message: `The information on the  water intake with the id: ${id} deleted successfully. `,
  });
};

export default {
  addWater: ctrWrapper(addWater),
  updateWater: ctrWrapper(updateWater),
  deleteWater: ctrWrapper(deleteWater),
};
