import { Schema, model } from "mongoose";
import { emailRegexp } from "../constans/user-constans.js";

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    oldPassword: {
      type: String,
      default: null,
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
      default: "",
    },
    sex: {
      type: String,
      enum: ["male", "female"],
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

const User = model("users", userSchema);

export default User;
