import { Schema, model } from "mongoose";
const memberSchema = new Schema({
  id: { type: String, required: true },
  familyId: { type: String, required: true },
  name: { type: String, required: true },
  imgLink: { type: String },
  userId: { type: String, default: null },
  createdAt: { type: Date, immutable: true, default: () => Date.now() },
  updatedAt: { type: Date, default: () => Date.now() },
  gender: { type: String, required: true },
  parents: { type: Array, required: true },
  spouse: { type: Array, required: true },
  children: { type: Array, required: true },
});
// function dynamicFamilyMemberSchema(prefix: any) {
//   return model(prefix + ".members", memberSchema);
// }

// //no we export dynamicSchema function
// export default dynamicFamilyMemberSchema;
export default model("members", memberSchema);
