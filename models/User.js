import { Schema, model } from "mongoose";
import { emailRegexp } from "../constans/user-constans.js";

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      match: emailRegexp,
      required: [true, "Email is required"],
      unique: true,
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    waterRate: {
      type: Number,
      default: 2,
    },
    passwordResetToken: { type: String, default: null },
  },
  { versionKey: false }
);

const User = model("User", userSchema);

export default User;
