import mongoose from "mongoose";
const clientCaseSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pricing: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    documents: [
      {
        public_id: {
          type: String,
          default: null,
        },
        url: {
          type: String,
          required: false,
          default: null,
        },
      },
    ],
    expertise: [
      {
        type: String,
        required: false,
      },
    ],

    status: {
      type: String,
      enum: ["looking", "hired", "completed"],
      default: "looking",
    },
    locationPreference: {
        type: String,
        required: false,
        },
  },
  {
    timestamps: true,
  }
);
const ClientCase = mongoose.model("ClientCase", clientCaseSchema);
export default ClientCase;
