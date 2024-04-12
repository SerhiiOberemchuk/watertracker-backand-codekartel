import * as waterServices from "../services/waterServices.js";
import HttpError from "../helpers/HttpError.js";
import {ctrWrapper} from "../helpers/ctrWrapper.js";

const getToday = async (req, res) => {
const { _id } = req.params;
const { _id: user } = req.user;
const { value } = req.params;
const { date } = req.params;
const result = await waterServices.getWaterToday({ _id: id, user, value, date });
if(!result) {
throw HttpError(404, "Not found");
}
res.json(result);
};

const updateTodayNow = async (req, res) => {
    const { _id } = req.params;
    const { _id: userId } = req.user;
    const { value } = req.params;
    const { date } = req.params;
    const result = await waterServices.updateWaterToday({ _id:id, userId, value, date });
    if (!result) {
        throw HttpError(404, "Not found");
    }
    res.json(result);
};


export default {
    getToday: ctrWrapper(getToday),
    updateTodayNow: ctrWrapper(updateTodayNow),
}