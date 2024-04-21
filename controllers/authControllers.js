import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import dotenv from "dotenv";
import sendEmail from "../helpers/sendEmail.js";

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

const sendMailRestore = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Missing required field email" });
  }

  const isUserWithEmail = await User.findOne({ email });
  if (!isUserWithEmail) {
    throw HttpError(404, "User not found or email is wrong!!!");
  }

  const payload = { _id: isUserWithEmail._id };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const updatedUser = await User.findOneAndUpdate(
    isUserWithEmail._id,
    {
      passwordResetToken: token,
    },
    { new: true }
  );

  const passwordPageLink = `"https://${BASE_URL}/water-tracker-frontend/update-password"`;

  const toEmail = {
    to: email,
    subject: "Restore Password",
    html: `We received a request to reset your password for your WaterTracker account. If you did not make this request, please ignore this email. Otherwise, you can reset your password using the link below:<br><br><a href=${passwordPageLink}  target='_blank'>Click here to restore your password</a><br><br>This link will expire in 23 hours for security reasons.<br><br>If you are having trouble clicking the link, copy and paste the URL directly into your browser. If you continue to have problems resetting your password, please contact our support team.<br><br>Thank you,<br>WaterTracker Support Team`,
  };

  await sendEmail(toEmail);

  res.status(201).json({
    message: `Message sent to email: ${email}`,
    passwordResetToken: updatedUser.passwordResetToken,
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
  sendMailRestore: ctrWrapper(sendMailRestore),
  resetPassword: ctrWrapper(resetPassword),
  logOut: ctrWrapper(logOut),
  updateAvatar: ctrWrapper(updateAvatar),
  updateUserInfo: ctrWrapper(updateUserInfo),
  getUserInfo: ctrWrapper(getUserInfo),
};
