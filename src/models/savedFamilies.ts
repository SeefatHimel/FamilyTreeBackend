import { Schema, model } from "mongoose";

const savedFamiliesSchema = new Schema({
  userId: { type: String, required: true },
  families: [String],
});

export default model("SavedFamilies", savedFamiliesSchema);
