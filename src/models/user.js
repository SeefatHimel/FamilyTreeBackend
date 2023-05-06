import { Schema, model } from "mongoose";
import { randomBytes, pbkdf2Sync } from "crypto";

const userSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  createdAt: { type: Date, immutable: true, default: () => Date.now() },
  updatedAt: { type: Date, default: () => Date.now() },
  hash: String,
  salt: String,
});
// Method to set salt and hash the password for a user
userSchema.methods.setPassword = function (password) {
  // Creating a unique salt for a particular user
  this.salt = randomBytes(16).toString("hex");

  // Hashing user's salt and password with 1000 iterations,

  this.hash = pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(
    `hex`
  );
};

// Method to check the entered password is correct or not
userSchema.methods.validPassword = function (password) {
  var hash = pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(
    `hex`
  );
  return this.hash === hash;
};

export default model("User", userSchema);
