import * as waterServices from "../services/waterServices.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";
import HttpError from "../helpers/HttpError.js";

const getPercentOfDailyNorm = async (req, res) => {
  const { _id: userId } = req.user;
  const { percentOfDailyNorm, arrayValues } =
    await waterServices.getWaterRecordsToday(userId);
  if (arrayValues.length === 0) {
    throw HttpError(404, "Not found");
  }
  res.json({ percentOfDailyNorm: percentOfDailyNorm, arrayValues });
};

export default {
  getPercentOfDailyNorm: ctrWrapper(getPercentOfDailyNorm),
};
