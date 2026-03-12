const mongoose = require("mongoose");

const likedvideosSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required:[true,'User Id is required who liked videos.']
    },
    videos: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Videos",
      default:''
    }],
    addedAt: {
      type: Date,
      default: Date.now,
    }
  }
);

const LikedVidoSchema=mongoose.model('LikedVideos',likedvideosSchema)
module.exports = LikedVidoSchema;