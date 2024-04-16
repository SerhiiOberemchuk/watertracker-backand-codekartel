import * as waterServices from "../services/waterServices.js";
import {ctrWrapper} from "../helpers/ctrWrapper.js";


const getPercentOfDailyNorm = async (req, res) => {
    const { userId, date } = req.user;
    const dailyNorm = req.user.waterRate; 
    const { percentOfDailyNorm, waterRecordsToday } = await waterServices.getWaterRecordsToday(userId, date, dailyNorm);
    res.json({ percentOfDailyNorm: percentOfDailyNorm, waterRecordsToday: waterRecordsToday });
  };

export default {
    getPercentOfDailyNorm: ctrWrapper(getPercentOfDailyNorm),
}


