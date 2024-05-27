import mongoose from "mongoose";

const customerSupportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CustomerSupport = mongoose.model(
  "CustomerSupport",
  customerSupportSchema
);


export default CustomerSupport;