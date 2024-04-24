import jwt from "jsonwebtoken";
import axios from "axios";
import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import dotenv from "dotenv";
import sendEmail from "../helpers/sendEmail.js";
import { customAlphabet } from 'nanoid';
import queryString from 'query-string';

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN, BASE_URL } = process.env;

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

  const payload = {
    id: newUser._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const updatedUser = await User.findOneAndUpdate(
    newUser._id,
    { token },
    { new: true }
  );

  res.status(201).json({
    message: "Congratulations! You have successfully registered!",
    newUser: {
      _id: updatedUser._id,
      email: updatedUser.email,
      token,
      avatarURL: updatedUser.avatarURL,
      name: updatedUser.name,
      gender: updatedUser.gender,
      waterRate: updatedUser.waterRate,
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

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Missing required field email" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404, "User not found or email is wrong!!!");
  }

  const nanoid = customAlphabet('1234567890qwertyuiopasdfghjklzxcvbnm', 16)
  const passwordResetToken = nanoid()

  user.passwordResetToken = passwordResetToken;
  await user.save()

  const passwordResetLink = `"https://${BASE_URL}/water-tracker-frontend/forgot-password/${passwordResetToken}"`;

  const toEmail = {
    to: email,
    subject: "Restore Password",
    html: `We received a request to reset your password for your WaterTracker account. Your password reset link: ${passwordResetLink}`,
  };

  await sendEmail(toEmail);

  res.status(200).json({
    message: `Message sent to email: ${email}`,
  });
};

const recoverPassword = async (req, res) => {
  const { password, token } = req.body;
  if (!password || !token) {
    return res.status(400).json({ message: "Bad request" });
  }

  const user = await User.findOne({ passwordResetToken: token });
  if (!user) {
    return res.status(400).json({ message: "Bad request" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.passwordResetToken = null;

  await user.save()

  res.status(200).json({
    message: `Password changed to: ${user.email}`,
  });
};

const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;
  try {
    const { _id } = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({ _id });
    if (!user) {
      next(HttpError(404, "User not found"));
    }
    if (token !== user.passwordResetToken) {
      next(HttpError(400, "Invalid or expired reset token"));
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    await user.save();

    res
      .status(200)
      .json({ message: "Your password has been changed successfully" });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        message:
          "The reset link has expired. Please request a new password reset.",
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
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
  if (Object.keys(updateData).length === 0) {
    throw HttpError(400, "No data was provided to update user information.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw HttpError(404, "User not found.");
  }

  let passwordUpdated = false;
  if (updateData.newPassword) {
    if (!updateData.oldPassword) {
      throw HttpError(
        400,
        "The current password is required to change the password."
      );
    }
    const { oldPassword } = updateData;
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw HttpError(
        401,
        "The current password is incorrect. Please, double check the current password."
      );
    }
    const { newPassword } = updateData;
    updateData.password = await bcrypt.hash(newPassword, 10);
    passwordUpdated = true;
  }

  delete updateData.oldPassword;
  delete updateData.newPassword;

  let message = "";
  let result;

  result = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password");

  if (!result) {
    throw HttpError(404, "Error updating user information.");
  }

  message = "User information updated successfully";
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

const googleAuth = async (req, res) => {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/users/google-redirect`,
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
  });
  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
  );
};

const googleRedirect = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const urlObj = new URL(fullUrl);
  const urlParams = queryString.parse(urlObj.search);

  const code = urlParams.code;

  const tokenData = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: "post",
    data: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BACKEND_URL}/users/google-redirect`,
      grant_type: "authorization_code",
      code,
    },
  });

  const userData = await axios({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
    method: "get",
    headers: {
      Authorization: `Bearer ${tokenData.data.access_token}`,
    },
  });

  const {email, name, picture} = userData.data;

  let user = await User.findOne({ email });
  if (!user) {
    user = new User()
    const nanoid = customAlphabet('1234567890qwertyuiopasdfghjklzxcvbnm', 16)
    const password = nanoid()
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword
  }

  user.email = email;
  user.name = name;
  user.avatarURL = picture;
  await user.save()

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { token },
    { new: true }
  ).select("-password");

  // res.status(200).json({
  //   message: "Congratulations! Login successful!",

  //   user: {
  //     _id: updatedUser._id,
  //     email: updatedUser.email,
  //     token: updatedUser.token,
  //     avatarURL: updatedUser.avatarURL,
  //     name: updatedUser.name,
  //     gender: updatedUser.gender,
  //     waterRate: updatedUser.waterRate,
  //   },
  // });

  return res.redirect(
    `${process.env.BASE_URL}/water-tracker-frontend/google/${updatedUser.token}`
  );
}

export default {
  signUp: ctrWrapper(signUp),
  signIn: ctrWrapper(signIn),
  resetPassword: ctrWrapper(resetPassword),
  logOut: ctrWrapper(logOut),
  updateAvatar: ctrWrapper(updateAvatar),
  updateUserInfo: ctrWrapper(updateUserInfo),
  getUserInfo: ctrWrapper(getUserInfo),
  forgotPassword: ctrWrapper(forgotPassword),
  recoverPassword: ctrWrapper(recoverPassword),
  googleAuth: ctrWrapper(googleAuth),
  googleRedirect: ctrWrapper(googleRedirect),
}
