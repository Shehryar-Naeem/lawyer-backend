import mongoose from "mongoose";
import { IClient } from "../../types/types.js";

const clientSchema = new mongoose.Schema<IClient>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // phone: {
    //   type: Number,
    //   required: [true, "Please Enter Your Phone Number"],
    //   validate: {
    //     validator: function (value: number) {
    //       // Check if the phone number is a number and has exactly 11 digits
    //       return /^\d{11}$/.test(value.toString());
    //     },
    //     message: "Phone number must be exactly 11 digits.",
    //   },
    // },
    // yourSelf: {
    //   type: String,
    //   required: [true, "Please Enter Your Self Description"],
    // },
    // address: {
    //   type: String,
    //   required: [true, "Please Enter Your Address"],
    // },
    // cnic: {
    //   type: Number,
    //   required: [true, "Please Enter Your CNIC"],
    //   unique: true,

    //   validate: {
    //     validator: function (value: number) {
    //       // Check if the phone number is a number and has exactly 11 digits
    //       return /^\d{13}$/.test(value.toString());
    //     },
    //     message: "CNIC number must be exactly 13 digits.",
    //   },
    // },
    // documents: [
    //   {
    //     public_id: {
    //       type: String,
    //       required: true,
    //       default: "3292||stalah",
    //     },
    //     url: {
    //       type: String,
    //       required: true,
    //       default:
    //         "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fvectors%2Fblank-profile-picture-mystery-man-973460%2F&psig=AOvVaw3yZ4ihZhlPWhab5e20wjxe&ust=1681274559120000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCMif9PeBof4CFQAAAAAdAAAAABAE",
    //     },
    //   },
    // ],
    // gender: {
    //   type: String,
    //   enum: ["male", "female"],
    //   required: [true, "Please enter Gender"],
    // },
    // age: {
    //   type: Number,
    //   required: [true, "Please enter age"],
    // },
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model<IClient>("Client", clientSchema);
export { Client };
