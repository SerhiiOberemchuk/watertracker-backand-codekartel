import { Schema, model } from "mongoose";
import { handleSaveError, setUpdateSettings } from "./hooks.js";

const waterRecordSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
});

const waterSchema = new Schema({
    waterRecords: [waterRecordSchema],
    dailyNorm: {
        type: Number,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

waterRecordSchema.post("save", handleSaveError);
waterRecordSchema.pre('findOneAndUpdate', setUpdateSettings);
waterRecordSchema.post("findOneAndUpdate", handleSaveError);

const waterRecord = model("WaterRecord", waterRecordSchema);


waterSchema.post("save", handleSaveError);
waterSchema.pre('findOneAndUpdate', setUpdateSettings);
waterSchema.post("findOneAndUpdate", handleSaveError);


 const Water = model("Water", waterSchema);



 export {waterRecord, Water};