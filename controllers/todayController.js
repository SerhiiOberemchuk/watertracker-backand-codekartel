import * as waterServices from "../services/waterServices.js";
import {ctrWrapper} from "../helpers/ctrWrapper.js";


const getPercentOfDailyNorm = async (req, res) => {
    const { userId, date } = req.user;
    const {waterRate} = req.user
    const { percentOfDailyNorm, arrayValuesOnly } = await waterServices.getWaterRecordsToday(userId, date, waterRate);
    res.json({ percentOfDailyNorm: percentOfDailyNorm, waterRecordsToday: arrayValuesOnly });
  };

export default {
    getPercentOfDailyNorm: ctrWrapper(getPercentOfDailyNorm),
}


