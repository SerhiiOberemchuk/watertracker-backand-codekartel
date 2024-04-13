import Water from "../models/Water.js";

export const getWaterToday = (filter) => Water.findOne(filter);

export const updateWaterToday = (filter, data) =>
  Water.findOneAndUpdate(filter, data, { new: true });

export const addWater = async (data) => {
  const water = await Water.create(data);
  return water;
};

export const deleteWater = (filter) => Water.findOneAndDelete(filter);
