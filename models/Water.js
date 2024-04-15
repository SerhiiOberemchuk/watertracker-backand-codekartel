import { Schema, model } from "mongoose";
import { handleSaveError, setUpdateSettings } from "./hooks.js";

const valueSchema = new Schema(
  {
    value: { type: Number, required: true },
    time: { type: String, required: true },
  },
  { _id: true }
);

const waterSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    waterRate: {
      type: Number,
      required: true,
    },
    arrayValues: [valueSchema],
    totalWater: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false }
);

waterSchema.post("save", handleSaveError);
waterSchema.pre("findOneAndUpdate", setUpdateSettings);
waterSchema.post("findOneAndUpdate", handleSaveError);

const Water = model("Water", waterSchema, "waters");

export default Water;
