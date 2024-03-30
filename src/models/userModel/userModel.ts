import mongoose from "mongoose";
import validator from "validator";
import { IUser } from "../../types/types.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Client } from "./clientModel.js";
import { Lawyer } from "./laywerModel.js";
import crypto from "crypto";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please Enter Your Name"],
      maxLength: [30, "Name cannot exceed 30 characters"],
      minLength: [4, "Name should have more than 4 characters"],
    },
    email: {
      type: String,
      required: [true, "Please Enter Your Email"],
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
      type: String,
      required: [true, "Please Enter Your Password"],
      minLength: [8, "Password should be greater than 8 characters"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
        default: "3292||stalah",
      },
      url: {
        type: String,
        default:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fvectors%2Fblank-profile-picture-mystery-man-973460%2F&psig=AOvVaw3yZ4ihZhlPWhab5e20wjxe&ust=1681274559120000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCMif9PeBof4CFQAAAAAdAAAAABAE",
      },
    },
    yourSelf: {
      type: String,
      default: null,
      // required: [true, "Please Enter Your Self Description"],
    },
    roles: [
      {
        _id: mongoose.Types.ObjectId,
        roleType: {
          type: String,
          enum: ["client", "lawyer", "admin"],
          default: "client",
        },
      },
    ],
    gender: {
      type: String,
      enum: ["male", "female"],
      default: null,

      // required: [true, "Please enter Gender"],
    },
    city: {
      type: String,
      default: null,
    },
    postalCode: {
      type: Number,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // const clientId = new mongoose.Types.ObjectId();
  // const lawyerId = new mongoose.Types.ObjectId();

  const hasClientRole = this.roles.some((role) => role.roleType === "client");
  // const hasLawyerRole = this.roles.some((role) => role.roleType === "lawyer");

  if (!hasClientRole) {
    const clientId = new mongoose.Types.ObjectId();
    this.roles.push({ _id: clientId, roleType: "client" });
    const client = new Client({ _id: clientId, user: this._id });
    await client.save();
  }

  // if (!hasLawyerRole) {
  //   const lawyerId = new mongoose.Types.ObjectId();
  //   this.roles.push({ _id: lawyerId, roleType: "lawyer" });
  //   const lawyer = new Lawyer({ _id: lawyerId, user: this._id });
  //   await lawyer.save();
  // }

  // Add both client and lawyer roles to the user
  // this.roles.push({ _id: clientId, roleType: "client" });
  // this.roles.push({ _id: lawyerId, roleType: "lawyer" });

  // const client = new Client({ _id: clientId, user: this._id });
  // const lawyer = new Laywer({ _id: lawyerId, user: this._id });

  // Save both client and lawyer records
  // Promise.all([client.save(), lawyer.save()])
  //   .then(() => next())
  //   .catch((err) => next(err));
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.getJWTToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  return token;
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000);
  return resetToken;
};
const User = mongoose.model<IUser>("User", userSchema);

export { User };
