import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const signUp = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    return next(HttpError(409, "Email in use"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
  });

  await newUser.save();
  const payload = {
    id: newUser._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  await User.findOneAndUpdate(newUser._id, { token });
  res.status(201).json({
    message: "Congratulations! You have successfully registered!",
    newUser: {
      _id: newUser._id,
      email: newUser.email,
      token,
      avatarURL: newUser.avatarURL,
      name: newUser.name,
      gender: newUser.gender,
      waterRate: newUser.waterRate,
    },
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { token },
    { new: true }
  ).select("-password");

  res.status(200).json({
    message: "Congratulations! Login successful!",

    user: {
      _id: updatedUser._id,
      email: updatedUser.email,
      token: updatedUser.token,
      avatarURL: updatedUser.avatarURL,
      name: updatedUser.name,
      gender: updatedUser.gender,
      waterRate: updatedUser.waterRate,
    },
  });
};

const logOut = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json();
};

export const updateAvatar = async (req, res, next) => {
  if (!req.file) {
    throw HttpError(400, "Please upload an avatar image file.");
  }
  const avatarURL = req.file.path;
  try {
    await User.findByIdAndUpdate(req.user._id, { avatarURL });
    res.json({ message: "Avatar updated successfully!", avatarURL });
  } catch (error) {
    throw HttpError(500, "Failed to update avatar.");
  }
};

const updateUserInfo = async (req, res) => {
  const { _id: userId } = req.user;
  const updateData = { ...req.body };
  let passwordUpdated = false;

  if (updateData.oldPassword && updateData.newPassword) {
    const { oldPassword, newPassword } = updateData;

    const user = await User.findById(userId);

    if (!user) {
      throw HttpError(404, "User not found");
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      throw HttpError(400, "Current password is incorrect");
    }

    updateData.password = await bcrypt.hash(newPassword, 10);
    passwordUpdated = true;
  }

  const result = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password");

  if (!result) {
    throw HttpError(404, "Not found");
  }

  let message = "User information updated successfully";
  if (passwordUpdated) {
    message += ", including password";
  }

  res.json({ message, user: result });
};

const getUserInfo = async (req, res) => {
  const { _id } = req.user;
  const userData = await User.findOne({ _id }).select("-password");
  res.json({
    user: {
      _id: userData._id,
      email: userData.email,
      token: userData.token,
      avatarURL: userData.avatarURL,
      name: userData.name,
      gender: userData.gender,
      waterRate: userData.waterRate,
    },
  });
};

export default {
  signUp: ctrWrapper(signUp),
  signIn: ctrWrapper(signIn),
  logOut: ctrWrapper(logOut),
  updateAvatar: ctrWrapper(updateAvatar),
  updateUserInfo: ctrWrapper(updateUserInfo),
  getUserInfo: ctrWrapper(getUserInfo),
};
