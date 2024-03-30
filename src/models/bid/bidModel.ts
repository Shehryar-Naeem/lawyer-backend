import mongoose from "mongoose";
const bidSchema = new mongoose.Schema({
    lawyer: { type: mongoose.Schema.Types.ObjectId, ref: "Lawyer" },
    case: { type: mongoose.Schema.Types.ObjectId, ref: "ClientCase" },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true,
    },
    serviceTitle: {
        type: String,
        required: true,
    },
    proposal: {
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
    expertise: [
        {
            type: String,
            required: false,
        },
    ],
    experience: {
        type: String,
        required: true,
    },
    
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
}, {
    timestamps: true,
});
const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
