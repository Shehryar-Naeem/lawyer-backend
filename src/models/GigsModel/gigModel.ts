import mongoose from "mongoose";
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
  },
  price: {
    type: Number,
    default: 0,
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
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        name: {
          type: String,
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

const Gig = mongoose.model("Gig", gigsSchema);
export { Gig };
