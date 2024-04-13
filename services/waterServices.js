import Water from "../models/Water.js";

import dayjs from "dayjs";

export const getWaterToday = (filter) => Water.findOne(filter);

export const updateWaterToday = (filter, data) =>
  Water.findOneAndUpdate(filter, data, { new: true });

export const addWater = async (data) => {
  const water = await Water.create(data);
  return water;
};

export const deleteWater = (filter) => Water.findOneAndDelete(filter);

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
      dailyNorm, // - Денна норма - кількість в літрах (приклад - 1.8 L)
      percentOfDailyNorm, // - Процент спожитої води від денної норми - кількість в процентах (приклад - 60%)
      recordsCount, //- Скільки разів були записи про споживання води - кількість спожвань (приклад - 6)
    });
  }

  return values;
};
