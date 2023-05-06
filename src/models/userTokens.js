import { Schema, model } from "mongoose";

const userTokenSchema = new Schema({
  email: { type: String, required: true, lowercase: true },
  refresh_token: { type: String, required: true },
});

export default model("UserTokens", userTokenSchema);
