import { Schema, model } from "mongoose";
import { handleSaveError, setUpdateSettings } from "./hooks.js";

const waterSchema = new Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    value: {
      type: Number,
      required: true,
    },
    time: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { versionKey: false, timestamps: true }
);

waterSchema.index({ date: 1, user: 1 }, { unique: true });

waterSchema.post("save", handleSaveError);
waterSchema.pre("findOneAndUpdate", setUpdateSettings);
waterSchema.post("findOneAndUpdate", handleSaveError);

const Water = model("Water", waterSchema, "water");

export default Water;
