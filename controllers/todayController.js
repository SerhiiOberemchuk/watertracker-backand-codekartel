import * as waterServices from "../services/waterServices.js";
import HttpError from "../helpers/HttpError.js";
import {ctrWrapper} from "../helpers/ctrWrapper.js";


const addWaterRecord = async (req, res) => {
    const { amount } = req.body;
    const { _id: user } = req.user;
    const record = await waterServices.createWaterRecord(user, value);
    res.status(201).json(record);
};


const getWaterRecordsToday = async (req, res) => {
    const { _id: user } = req.user;
    const result = await waterServices.getWaterRecordsForToday(user);
    if (!result) {
        throw HttpError(404, "Not found");
    }
    res.json(result);
};

const getPercentOfDailyNorm = async (req, res) => {
const { _id: user } = req.user;
const { dailyNorm } = req.params;
const records = await waterServices.getWaterRecordsForToday(user);
const totalAmount = records.reduce((total,record)=> total + record.value, 0);
const percentOfDailyNorm = (totalAmount / dailyNorm) * 100;
res.json({percentOfDailyNorm, records});
};

export default {
    addWaterRecord: ctrWrapper(addWaterRecord),
    getWaterRecordsToday: ctrWrapper(getWaterRecordsToday),
    getPercentOfDailyNorm: ctrWrapper(getPercentOfDailyNorm),
}