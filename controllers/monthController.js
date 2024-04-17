import * as waterServices from "../services/waterServices.js";
import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";

const getMonth = async (req, res) => {

  const { date } = req.query; // 2024-04
  const { _id: userId } = req.user;
  const result = await waterServices.getWaterMonth(userId, date);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};


export default {
  getMonth: ctrWrapper(getMonth),
}
