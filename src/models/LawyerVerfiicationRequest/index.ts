import mongoose from "mongoose";

const lawyerVerificationRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const LawyerVerificationRequest = mongoose.model(
  "LawyerVerificationRequest",
  lawyerVerificationRequestSchema
);
export default LawyerVerificationRequest;
