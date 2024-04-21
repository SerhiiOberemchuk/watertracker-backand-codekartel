import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

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

  res.status(201).json({
    message: "Congratulations! You have successfully registered!",
    email: newUser.email,
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
  let passwordUpdateError = "";

  if (updateData.newPassword && !updateData.oldPassword) {
    passwordUpdateError =
      "the current password is required to change the password. ";
  } else if (updateData.oldPassword) {
    const { oldPassword } = updateData;

    const user = await User.findById(userId);

    if (!user) {
      passwordUpdateError = "User not found. ";
    } else {
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);

      if (!passwordMatch) {
        passwordUpdateError =
          "the current password is incorrect. Please, double check the current password.";
      } else if (updateData.newPassword) {
        const { newPassword } = updateData;
        updateData.password = await bcrypt.hash(newPassword, 10);
        passwordUpdated = true;
      } else {
        passwordUpdateError = "the new password is required. ";
      }
    }
  }

  delete updateData.oldPassword;
  delete updateData.newPassword;

  let message = "";
  let result;

  if (Object.keys(updateData).length > 0 || passwordUpdated) {
    result = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!result) {
      throw HttpError(404, "Not found");
    }

    message = "User information updated successfully";
  } else {
    message = "No user information was updated";
  }

  if (passwordUpdated) {
    message += ", including password";
  }

  if (passwordUpdateError) {
    if (passwordUpdateError === "the current password is incorrect. ") {
      message = "Password was not updated because " + passwordUpdateError;
    } else if (message === "No user information was updated") {
      message +=
        ". The password was not updated because " + passwordUpdateError;
    } else {
      message +=
        ". However, the password was not updated because " +
        passwordUpdateError;
    }
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
