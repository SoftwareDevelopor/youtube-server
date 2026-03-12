const mongoose = require("mongoose");

const watchLaterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required:[true,'User Id is required who created watch later.']
    },
    videos: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Videos",
      default: ''
    }],
    addedAt: {
      type: Date,
      default: Date.now,
    }
  }
);

const WatchLaterSchema=mongoose.model('WatchLaters',watchLaterSchema)
module.exports = WatchLaterSchema;