import * as waterServices from "../services/waterServices.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";
import HttpError from "../helpers/HttpError.js";

const getPercentOfDailyNorm = async (req, res) => {
  const { _id: userId } = req.user;

  const myRecords = await waterServices.getWaterRecordsToday(userId);
  if (!myRecords || myRecords.arrayValues.length === 0) {
    throw HttpError(404, "Not found records for today");
  }
  const { percentOfDailyNorm, arrayValues } = myRecords;
  res.json({
    percentOfDailyNorm: percentOfDailyNorm,
    arreyWaterRecords: arrayValues,
  });
};

export default {
  getPercentOfDailyNorm: ctrWrapper(getPercentOfDailyNorm),
};
