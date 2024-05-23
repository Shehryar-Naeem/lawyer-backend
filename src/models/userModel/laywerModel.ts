import mongoose from "mongoose";
import { ILawyer } from "../../types/types.js";

const LawyerSchema = new mongoose.Schema<ILawyer>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    availability: {
      // officeHours: {
      //   type: String,
      //   required: false,
      // },
      days: {
        type: [String],
        required: false,
        default: null,
      },
      officaAddress: {
        type: [String],
        required: false,
        default: null,
      },
    },

    cnicPicture: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
    },

    lawyerIdCard: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
    },

    professionalInfo: {
      lawFirmName: {
        type: String,
        default: null,
      },
      title: {
        type: String,
        default: null,
      },
      barAdmission: {
        state: {
          type: String,
          default: null,
        },
        licenseNumber: {
          type: String,
          default: null,
        },
      },
      experience: {
        type: String,
        default: null,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    education: {
      completionYear: {
        startYear: {
          type: Number,
          default: null,
        },
        endYear: {
          type: Number,
          default: null,
        },
      },
      institution: {
        type: String,
        default: null,
      },
      degreeName: {
        type: String,
        default: null,
      },
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    gigs: [
      {
        type: mongoose.Schema.Types.ObjectId, // Use mongoose.Schema.Types.ObjectId here
        ref: "Gig",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Lawyer = mongoose.model<ILawyer>("Lawyer", LawyerSchema);
export { Lawyer };
