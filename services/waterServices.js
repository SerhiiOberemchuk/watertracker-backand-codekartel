import Water from "../models/Water.js";


export const getWaterToday = (filter) => Water.findOne(filter);

export const updateWaterToday = (filter, data) => Water.findOneAndUpdate(filter, data);