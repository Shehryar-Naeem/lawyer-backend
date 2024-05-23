import mongoose from "mongoose";

const documentSchema  = new mongoose.Schema({
    postId: {
        type :mongoose.Schema.ObjectId,
        ref:"ClientCase"
    },
    file:{
        
    }
})