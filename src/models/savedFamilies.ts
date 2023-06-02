import { Schema, model } from "mongoose";

const family = {
  id: { type: String, required: true },
  name: { type: String, required: true },
};
const savedFamiliesSchema = new Schema({
  userId: { type: String, required: true },
  families: [family],
});

export default model("SavedFamilies", savedFamiliesSchema);
