const mongoose = require("mongoose");

const savedFamiliesSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  families: [family],
});
const family = {
  id: { type: String, required: true },
  name: { type: String, required: true },
};

module.exports = mongoose.model("SavedFamilies", savedFamiliesSchema);
