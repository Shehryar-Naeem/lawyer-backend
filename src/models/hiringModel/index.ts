import mongoose from "mongoose";

const Schema = mongoose.Schema;

const hiringSchema = new Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: "ClientCase" },
  gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig" },
  type: {
    type: String,
    enum: ["job", "gig"],

    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bid",
  },

  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["hired", "completed", "cancelled"],

    default: "hired",
  },
  client_mark_as_completed: {
    type: Boolean,
    default: false,
  },
  lawyer_mark_as_completed: {
    type: Boolean,
    default: false,
  },
});

const Hiring = mongoose.model("Hiring", hiringSchema);

export default Hiring;
