import { get } from "mongoose";
import Water from "../models/Water.js";
import dayjs from "dayjs";

export const getWaterRecordById = (filter) => Water.findById(filter);

export const updateWaterRecordById = async (
  userId,
  waterRecordId,
  newValue,
  newTime
) => {
  const user = await getWaterRecordById({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  const index = user.arrayValues.findIndex(
    (item) => item._id === waterRecordId
  );

  if (index === -1) {
    throw new Error("Water record not found");
  }

  user.arrayValues[index].value = newValue;
  user.arrayValues[index].time = newTime;

  // Save the updated user object
  await user.save();

  return user;
};

export const updateWaterToday = (filter, data) =>
  Water.findOneAndUpdate(filter, data, { new: true });

export const addWater = async (data) => {
  const { user, waterRate, arrayValues } = data;
  let today = await Water.findOne({
    userId: user._id,
    date: { $gte: dayjs().startOf("day"), $lte: dayjs().endOf("day") },
  });

  if (!today) {
    const totalWater = arrayValues.reduce((acc, item) => {
      const value = item.value !== undefined ? Number(item.value) : 0;
      return isNaN(value) ? acc : acc + value;
    }, 0);

    today = await Water.create({
      userId: user._id,
      waterRate,
      arrayValues,
      totalWater,
    });

    await today.save();
    return today;
  }

  const totalWater = arrayValues.reduce((acc, item) => {
    const value = item.value !== undefined ? Number(item.value) : 0;
    return isNaN(value) ? acc : acc + value;
  }, today.totalWater);

  const updated = await Water.findByIdAndUpdate(today._id);
  if (!updated) {
    throw new Error("Water document not found");
  }

  updated.arrayValues.push(...arrayValues);
  updated.totalWater = isNaN(totalWater) ? 0 : totalWater;
  await updated.save();
  return updated;
};

export const deleteWater = (filter) => Water.findOneAndDelete(filter);

export const getWaterRecordsToday = async (userId, date,waterRate) => {
  const startOfDay = dayjs(date).startOf("day");
  const endOfDay = dayjs(date).endOf("day");
  const waterRecordsToday = await Water.find({
    date: { $gte: startOfDay, $lte: endOfDay },
  });
  const arrayValuesOnly = waterRecordsToday.flatMap(record => record.arrayValues);

  const totalWater = waterRecordsToday.reduce((total, record) => {
    const sumOfArrayValues = record.arrayValues.reduce(
      (sum, value) => sum + value.value / 1000,
      0
    );
    return total + sumOfArrayValues;
  }, 0);
  const waterRateFloat = parseFloat(waterRate);
  const percentOfDailyNorm = Math.round((totalWater / waterRateFloat) * 100);

  return { arrayValuesOnly, percentOfDailyNorm };
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
    const percentOfWaterRate = Math.round(sumOfValues / (waterRate * 1000) * 100);
    const recordsCount = oneDayData?.arrayValues?.length;
    values.push({
      date,
      waterRate: isFinite(waterRate) ? `${waterRate} L` : null,
      percentOfWaterRate:
      percentOfWaterRate && isFinite(percentOfWaterRate)
          ? `${percentOfWaterRate}%`
          : null,
      recordsCount:recordsCount ?? 0,
    });
  }

  return values;
};
