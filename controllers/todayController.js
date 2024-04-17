import * as waterServices from "../services/waterServices.js";
import {ctrWrapper} from "../helpers/ctrWrapper.js";


  const getPercentOfDailyNorm = async (req, res) => {
    const { _id: userId } = req.user;
    const { percentOfDailyNorm, arrayValues } =
      await waterServices.getWaterRecordsToday(userId);
    res.json({ percentOfDailyNorm: percentOfDailyNorm,  arrayValues });
  };

export default {
    getPercentOfDailyNorm: ctrWrapper(getPercentOfDailyNorm),
}


