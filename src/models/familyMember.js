var mongoose = require("mongoose");
const memberSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  imgLink: { type: String },
  imgPath: { type: String },
  createdAt: { type: Date, immutable: true, default: () => Date.now() },
  updatedAt: { type: Date, default: () => Date.now() },
  gender: { type: String, required: true },
  parents: { type: Array, required: true },
  spouse: { type: Array, required: true },
  children: { type: Array, required: true },
});
function dynamicFamilyMemberSchema(prefix) {
  return mongoose.model(prefix + ".members", memberSchema);
}

//no we export dynamicSchema function
module.exports = dynamicFamilyMemberSchema;
