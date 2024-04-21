import * as waterServices from "../services/waterServices.js";
import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";
import User from "../models/User.js";
import Water from "../models/Water.js";

const addWater = async (req, res) => {
  const { _id: user, waterRate } = req.user;

  const { value } = req.body;
  const { time } = req.body;
  const result = await waterServices.addWater({
    user,
    arrayValues: [{ value, time }],
    waterRate,
  });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json({
    message: "Water record added successfuly",
    addedWaterRecord: result,
  });
};

export const writeWaterRateInRecord = async (amountOfWater, _id) => {
  const isRecord = await checkWhetherWaterRecordExists(_id);
  if (isRecord) {
    await Water.updateOne(
      { _id: isRecord._id },
      {
        $set: { waterRate: amountOfWater },
      }
    );
  }
};

const updateWater = async (req, res) => {
  const { value, time } = req.body;
  const userId = req.user._id;
  const { _id: objectId } = req.params;

  const waterRecordToUpdate = await waterServices.updateValueWater(
    userId,
    objectId,
    value,
    time
  );
  if (!waterRecordToUpdate) {
    throw HttpError(404, "Water record not found");
  }

  res.json({
    message: "Water record is updated successfuly",
    updatedWaterRecord: waterRecordToUpdate,
  });
};

const deleteWater = async (req, res) => {
  const { _id: userId } = req.user;
  const { _id: recordId } = req.params;
  const deletedRecord = await waterServices.deleteRecordInArrey(
    userId,
    recordId
  );
  if (!deletedRecord) {
    throw HttpError(404, "Not found");
  }
  res.json({
    message: `The information on the water intake below deleted successfully.`,
    deletedWaterRecord: deletedRecord,
  });
};

const waterRateCtrl = async (req, res, next) => {
  const { amountOfWater } = req.body;

  const { _id } = req.user;
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { waterRate: amountOfWater },
    { new: true }
  );
  if (amountOfWater > 15 || amountOfWater <= 0) {
    throw HttpError(
      400,
      "The amount of water can't be more than 15l or less than 1ml"
    );
  }
  if (!updatedUser) {
    throw HttpError(404, "Not found");
  }
  await waterServices.writeWaterRateInRecord(amountOfWater, _id);

  res.json({
    message: "New water rate",
    waterRate: updatedUser.waterRate,
  });
};

export default {
  addWater: ctrWrapper(addWater),
  updateWater: ctrWrapper(updateWater),
  deleteWater: ctrWrapper(deleteWater),
  waterRateCtrl: ctrWrapper(waterRateCtrl),
};
