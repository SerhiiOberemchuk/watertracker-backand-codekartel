import Water from "../models/Water.js";
import dayjs from "dayjs";

export const getWaterRecordById = async (userId) => {
  return await Water.findOne({ userId: userId });
};

// export const updateWaterToday = async (filter, data) =>
//   await Water.findOneAndUpdate(filter, data, { new: true });

export const checkWhetherWaterRecordExists = async (userId) => {
  let today = await Water.findOne({
    userId,
    date: {
      $gte: dayjs().startOf("day").toDate(),
      $lte: dayjs().endOf("day").toDate(),
    },
  });

  return today;
};

export const updateValueWater = async (userId, objectId, value, time) => {
  const updateRecord = await Water.findOneAndUpdate(
    { userId, "arrayValues._id": objectId },
    { $set: { "arrayValues.$.value": value, "arrayValues.$.time": time } },
    { new: true }
  );
  const updatedObject = updateRecord.arrayValues.find(
    (obj) => obj._id.toString() === objectId
  );
  const newTotalWater = recalculateTotalWater(updateRecord.arrayValues);

  await Water.updateOne(
    { _id: updateRecord._id },
    { $set: { totalWater: newTotalWater } }
  );

  return updatedObject;
};

export const findIndexById = (array, id) => {
  const index = array.findIndex((element) => element._id.toString() === id);

  if (index === -1) {
    throw new Error("Array value not found");
  }

  return index;
};

export const recalculateTotalWater = (array) => {
  return array.reduce((total, element) => total + element.value, 0);
};

export const addWater = async (data) => {
  const { user, waterRate, arrayValues } = data;
  let today = await checkWhetherWaterRecordExists(user);

  if (!today) {
    const totalWater = arrayValues.reduce(
      (acc, item) => acc + Number(item.value || 0),
      0
    );

    today = new Water({
      userId: user._id,
      waterRate,
      arrayValues,
      totalWater,
    });

    await today.save();
    return today;
  }

  const newTotalWater = arrayValues.reduce(
    (acc, item) => acc + Number(item.value || 0),
    today.totalWater
  );

  const updated = await Water.findByIdAndUpdate(
    today._id,
    {
      $push: { arrayValues: { $each: arrayValues } },
      $set: { totalWater: newTotalWater },
    },
    { new: true }
  );

  return updated;
};

// export const deleteWater = (filter) => Water.findOneAndDelete(filter);
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

export const getWaterRecordsToday = async (userId) => {
  const waterRecordsToday = await Water.findOne({
    userId,
    date: { $gte: dayjs().startOf("day"), $lte: dayjs().endOf("day") },
  });

  const { arrayValues, totalWater, waterRate } = waterRecordsToday;

  const percentOfDailyNorm = Math.round((totalWater / waterRate / 1000) * 100);

  return { arrayValues, percentOfDailyNorm };
};

export const getWaterMonth = async (userId, date) => {
  const firstDayOfMonth = dayjs(date).startOf("month").toISOString();
  const lastDayOfMonth = dayjs(date).endOf("month").toISOString();
  const daysInMonth = dayjs(date).daysInMonth();
  const currMonth = dayjs(date).format("MMMM");

  const oneMonthData = await Water.find({
    userId,
    date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
  }).lean();

  const values = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const oneDayData = oneMonthData.find(
      (item) => dayjs(item.date).date() === day
    );
    console.log(oneDayData);
    const date = `${day}, ${currMonth}`;
    const waterRate = oneDayData?.waterRate;
    const sumOfValues = oneDayData?.totalWater;
    const percentOfWaterRate = Math.round(
      (sumOfValues / (waterRate * 1000)) * 100
    );
    const recordsCount = oneDayData?.arrayValues?.length;
    values.push({
      date,
      waterRate: isFinite(waterRate) ? waterRate : null,
      percentOfWaterRate:
        percentOfWaterRate && isFinite(percentOfWaterRate)
          ? percentOfWaterRate
          : null,
      recordsCount: recordsCount ?? 0,
    });
  }

  return values;
};
