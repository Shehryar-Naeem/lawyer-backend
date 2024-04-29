import mongoose, { Model } from "mongoose";
import { IGig } from "../../types/types.js";
const validateTitleLength = (title: string) => {
  const words = title.split(" ");
  // return words.length <= 8;

  return words.length >= 3 && words.length <= 8;
};
const valiateDiscriptionLength = (discription: string) => {
  const words = discription.split(" ");
  return words.length >= 30 && words.length <= 100;
};

const pricingAndServiceSchema = new mongoose.Schema({
  services: {
    type: [String],
    default: [],
    index: true, 
  },
  price: {
    type: Number,
    default: 0,
    index: true, 
  },
  additionalCost: {
    services: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      default: 0,
    },
  },
});
const gigsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      // validate: [validateTitleLength, "Title must have between 3 and 8 words"],
    },
    description: {
      type: String,
      // validate: [
      //   valiateDiscriptionLength,
      //   "Description must have between 30 and 100 words",
      // ],
    },
    pricing: {
      type: pricingAndServiceSchema,
      default: {},
    },

    images: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
   

    category: {
      type: [String],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    city: {
      type: String,
      default: null,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
        },
        comment: {
          type: String,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // unique: true,
    },
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Gig: Model<IGig> = mongoose.model<IGig>('Gig', gigsSchema);

export { Gig };
