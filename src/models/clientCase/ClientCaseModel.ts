import mongoose from "mongoose";
const clientCaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },

    // documents: [
    //   {
    //     public_id: {
    //       type: String,
    //       default: null,
    //     },
    //     url: {
    //       type: String,
    //       required: false,
    //       default: null,
    //     },
    //   },
    // ],

    category: {
      type: String,
      required: false,
    },

    experience: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: ["looking", "hired", "completed"],
      default: "looking",
    },
    isStopRecievingRequest: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      required: false,
    },
    majorIssues: [
      {
        type: String,
        required: false,
      },
    ],
    hiredLawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    hiredBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
      required: false,
    },
    clientStatus: {
      type: String,
      enum: ["completed"],
      default: null,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
const ClientCase = mongoose.model("ClientCase", clientCaseSchema);
export default ClientCase;
