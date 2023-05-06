import { Schema, model } from "mongoose";

const savedFamiliesSchema = new Schema({
  userId: { type: String, required: true },
  families: [family],
});
const family = {
  id: { type: String, required: true },
  name: { type: String, required: true },
};

export default model("SavedFamilies", savedFamiliesSchema);
