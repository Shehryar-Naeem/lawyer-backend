import mongoose from "mongoose";
const bidSchema = new mongoose.Schema(
  {
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    case: { type: mongoose.Schema.Types.ObjectId, ref: "ClientCase" },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    proposal: {
      type: String,
      required: true,
    },
    pricing: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "hired", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);
const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
