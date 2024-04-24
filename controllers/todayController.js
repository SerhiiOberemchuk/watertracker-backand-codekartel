import * as waterServices from "../services/waterServices.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";

const getPercentOfDailyNorm = async (req, res) => {
  const { _id: userId } = req.user;

  const myRecords = await waterServices.getWaterRecordsToday(userId);
  if (!myRecords || myRecords.arrayValues.length === 0) {
    return res.json({
      message: "No water records found for today.",
      percentOfDailyNorm: 0,
      arreyWaterRecords: [],
    });
  }
  const { percentOfDailyNorm, arrayValues } = myRecords;
  return res.json({
    message: "You have records for today.",
    percentOfDailyNorm: percentOfDailyNorm,
    arreyWaterRecords: arrayValues,
  });
};

export default {
  getPercentOfDailyNorm: ctrWrapper(getPercentOfDailyNorm),
};
