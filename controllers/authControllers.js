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

  res.status(201).json({
    message: "Congratulations! You have successfully registered!",
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

  await User.findByIdAndUpdate(user._id, { token });
  res.status(200).json({
    token,
    message: "Congratulations! Login successful!",
  });
};

const logOut = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json();
};

export default {
  signUp: ctrWrapper(signUp),
  signIn: ctrWrapper(signIn),
  logOut: ctrWrapper(logOut),
};
