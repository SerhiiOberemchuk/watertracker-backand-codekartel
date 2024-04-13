import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs/promises";
import gravatar from "gravatar";
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
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    avatarURL,
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
  );

  res.status(200).json({
    message: "Congratulations! Login successful!",

    user: updatedUser,
  });
};

const logOut = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json();
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;

  if (!req.file) {
    throw HttpError(400, "Please upload the file");
  }
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);

  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("/avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  if (!avatarURL) {
    throw HttpError(401, "Not authorized");
  }

  res.json({ avatarURL });
};

const updateUserInfo = async (req, res) => {
  const userId = req.params._id;
  const updateData = { ...req.body };
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  const result = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  });

  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json(result);
};

const getUserInfo = async (req, res) => {
  const id = req.params._id;
  const userData = await User.findOne({ _id: id }, "-createdAt -updatedAt");
  res.json(userData);
};

export default {
  signUp: ctrWrapper(signUp),
  signIn: ctrWrapper(signIn),
  logOut: ctrWrapper(logOut),
  updateAvatar: ctrWrapper(updateAvatar),
  updateUserInfo: ctrWrapper(updateUserInfo),
  getUserInfo: ctrWrapper(getUserInfo),
};
