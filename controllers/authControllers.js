import fs from "fs/promises";
import gravatar from "gravatar";

import * as authServices from "../services/authServices.js";
import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";
import path from "path";
import Jimp from "jimp";
import { nanoid } from "nanoid";
import sendEmail from "../helpers/sendEmail.js";

const { JWT_SECRET, BASE_URL } = process.env;

const avatarsPath = path.resolve("public", "avatars");

const signup = async (req, res) => {
  const { email } = req.body;
  const user = await authServices.findeUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const verificationToken = nanoid();

  const avatarURL = gravatar.url(email);

  const newUser = await authServices.signup({
    ...req.body,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a href="${BASE_URL}/api/users/verify/${verificationToken}" target="_blank">Click to verify</a> `,
  };
  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await authServices.findeUser({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }

  await authServices.updateUser(
    { _id: user._id },
    { verify: true, verificationToken: "null" }
  );
  res.json({ message: "Verification successful" });
};

const sendMail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "missing required field email" });
  }

  const user = await authServices.findeUser({ email });

  if (!user) {
    throw HttpError(404, "User not found or email is wrong");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a href="${BASE_URL}/api/users/verify/${user.verificationToken}" target="_blank">Click to verify</a> `,
  };

  await sendEmail(verifyEmail);

  res.json({ message: "Verification email sent" });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.findeUser({ email });

  if (!user.verify) {
    throw HttpError(404, "User`s email not verified!");
  }

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const comparePassword = await authServices.isValidPassword(
    password,
    user.password
  );

  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }

  const { _id: id } = user;
  const payload = { id };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  await authServices.updateUser({ _id: id }, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await authServices.updateUser({ _id }, { token: null });
  res.status(204).json({ message: "Logout success" });
};

const updateSubscribe = async (req, res) => {
  const { subscription } = req.body;
  const { _id } = req.user;
  await authServices.updateUser({ _id }, { subscription });

  res.json({ message: `Subscription is ${subscription}` });
};

const resizeImage = async (path) => {
  const image = await Jimp.read(path);
  await image.resize(250, Jimp.AUTO);
  await image.writeAsync(path);
};

const updateAvatar = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, "Avatar file is required");
  }

  const { path: oldPath, filename } = req.file;

  const pathImage = path.join("tmp", filename);
  await resizeImage(pathImage);

  const newPath = path.join(avatarsPath, filename);
  await fs.rename(oldPath, newPath);

  const { _id } = req.user;
  await authServices.updateUser({ _id }, { avatarURL: `/avatars/${filename}` });
  res.status(200).json({ avatarURL: `/avatars/${filename}` });
};

export default {
  signup: ctrWrapper(signup),
  verify: ctrWrapper(verify),
  sendMail: ctrWrapper(sendMail),
  signin: ctrWrapper(signin),
  getCurrent: ctrWrapper(getCurrent),
  logout: ctrWrapper(logout),
  updateSubscribe: ctrWrapper(updateSubscribe),
  updateAvatar: ctrWrapper(updateAvatar),
};
