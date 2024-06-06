import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  // postId: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: "ClientCase",
  // },
  // gigId: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: "Gig",
  // },
  hiring: {
    type: mongoose.Schema.ObjectId,
    ref: "Hiring",
  },
  file: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    // type: String,
    // required: true,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
