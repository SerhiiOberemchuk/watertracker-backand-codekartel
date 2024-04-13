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

waterRecordSchema.post("save", handleSaveError);
waterRecordSchema.pre('findOneAndUpdate', setUpdateSettings);
waterRecordSchema.post("findOneAndUpdate", handleSaveError);

const waterRecord = model("WaterRecord", waterRecordSchema);
export default waterRecord;