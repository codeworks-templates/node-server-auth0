import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Value = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    creatorId: { type: String, ref: "Profile", required: true }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

Value.virtual("creator", {
  localField: "creatorId",
  ref: "Profile",
  foreignField: "_id",
  justOne: true
});

export default Value;
