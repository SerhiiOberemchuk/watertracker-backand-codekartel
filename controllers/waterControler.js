import * as waterServices from "../services/waterServices.js";
import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";
import User from "../models/User.js";
import { ObjectId } from "mongodb";

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
  res.json(result);
};

const updateWater = async (req, res) => {
  const { value, time } = req.body;
  const userId = req.user._id;
  const { _id: arrayValueId } = req.params;

  const waterRecordToUpdate = await waterServices.getWaterRecordById(userId);

  if (!waterRecordToUpdate) {
    throw HttpError(404, "Water record not found");
  }

  const arrayValueIndex = waterServices.findIndexById(
    waterRecordToUpdate.arrayValues,
    arrayValueId
  );

  waterRecordToUpdate.arrayValues[arrayValueIndex] = { value, time };
  waterRecordToUpdate.totalWater = waterServices.recalculateTotalWater(
    waterRecordToUpdate.arrayValues
  );
  const updatedWaterRecord = await waterRecordToUpdate.save();

  if (!updatedWaterRecord) {
    throw HttpError(404, "Not found");
  }

  res.json(updatedWaterRecord);
};

const deleteWater = async (req, res) => {
  const userId = req.user._id;
  const { _id: arrayValueId } = req.params;

  const waterRecordToDelete = await waterServices.getWaterRecordById(userId);
  if (!waterRecordToDelete) {
    throw HttpError(404, "Water record not found");
  }

  const arrayValueIndex = waterServices.findIndexById(
    waterRecordToDelete.arrayValues,
    arrayValueId
  );

  // Remove the intake object from the arrayValues array
  const deletedArrayValue = waterRecordToDelete.arrayValues.splice(
    arrayValueIndex,
    1
  );

  waterRecordToDelete.totalWater = waterServices.recalculateTotalWater(
    waterRecordToDelete.arrayValues
  );

  // Save the waterRecord to the database
  const updatedWaterRecord = await waterRecordToDelete.save();

  res.json({
    message: `The information on the water intake below deleted successfully.`,
    deletedRecord: deletedArrayValue[0],
    updatedTotalWater: updatedWaterRecord.totalWater,
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

  res.json({ updatedUser });
};

export default {
  addWater: ctrWrapper(addWater),
  updateWater: ctrWrapper(updateWater),
  deleteWater: ctrWrapper(deleteWater),
  waterRateCtrl: ctrWrapper(waterRateCtrl),
};
