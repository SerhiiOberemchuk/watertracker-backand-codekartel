import { get } from "mongoose";
import Water from "../models/Water.js";
import dayjs from "dayjs";

export const getWaterRecordById = async (userId) => {
  return await Water.findOne({ userId: userId });
};

export const updateWaterToday = async (filter, data) =>
  await Water.findOneAndUpdate(filter, data, { new: true });

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

export const deleteWater = (filter) => Water.findOneAndDelete(filter);

export const getWaterRecordsToday = async (userId, date, dailyNorm) => {
  const startOfDay = dayjs(date).startOf("day");
  const endOfDay = dayjs(date).endOf("day");
  const waterRecordsToday = await Water.find({
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  const totalValue = waterRecordsToday.reduce((total, record) => {
    const sumOfArrayValues = record.arrayValues.reduce(
      (sum, value) => sum + value.value / 1000,
      0
    );
    return total + sumOfArrayValues;
  }, 0);
  const dailyNormFloat = parseFloat(dailyNorm);
  const percentOfDailyNorm = Math.round((totalValue / dailyNormFloat) * 100);

  return { waterRecordsToday, totalValue, percentOfDailyNorm };
};

export const getWaterMonth = async (user, date) => {
  const firstDayOfMonth = dayjs(date).startOf("month").toISOString();
  const lastDayOfMonth = dayjs(date).endOf("month").toISOString();
  const daysInMonth = dayjs(date).daysInMonth();
  const currMonth = dayjs(date).format("MMMM");

  const oneMonthData = await Water.find({
    user,
    date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
  }).lean();

  const values = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const oneDayData = oneMonthData.filter(
      (item) => dayjs(item.date).date() === day
    );
    const date = `${day}, ${currMonth}`;
    const dailyNorm = Math.max(...oneDayData.map((item) => item.dailyNorm));
    const sumOfValues = oneDayData.reduce(
      (accumulator, item) => accumulator + item.value,
      0
    );
    const percentOfDailyNorm = Math.round((sumOfValues / dailyNorm) * 100);
    const recordsCount = oneDayData.length;
    values.push({
      date, // - Дата  в форматі - число, місяць (приклад - 5, April)
      dailyNorm: isFinite(dailyNorm) ? `${dailyNorm / 1000} L` : null, // - Денна норма - кількість в літрах (приклад - 1.8 L)
      percentOfDailyNorm:
        percentOfDailyNorm && isFinite(percentOfDailyNorm)
          ? `${percentOfDailyNorm}%`
          : null, // - Процент спожитої води від денної норми - кількість в процентах (приклад - 60%)
      recordsCount, //- Скільки разів були записи про споживання води - кількість спожвань (приклад - 6)
    });
  }

  return values;
};
