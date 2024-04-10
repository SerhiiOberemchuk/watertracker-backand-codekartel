import bcrypt from "bcrypt";

import User from "../models/User.js";

export const findeUser = (filter) => User.findOne(filter);

export const signup = async (data) => {
  const hashPassword = await bcrypt.hash(data.password, 10);

  return User.create({ ...data, password: hashPassword });
};

export const isValidPassword = async (password, hashPassword) =>
  bcrypt.compare(password, hashPassword);

export const updateUser = (filter, data) => User.findOneAndUpdate(filter, data);
