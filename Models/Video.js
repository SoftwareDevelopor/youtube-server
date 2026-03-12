const mongoose = require('mongoose');
let videoSchema = new mongoose.Schema(
  {
    videotitle: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default:''
    },
    videofile: {
      type: String,
      default:''
    },
    visibility: {
      type: String,
      required: true
    },
    videouploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },
    video_tags: {
      type:Array,
      default:[]
    },
    description: {
      type: String,
      required: true,
    },
    agerestriction: {
      type: Number,
      required: true,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    comments: {
      type: Array,
      default: []
    },
    likes: {
      type: Number,
      default: 0
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      default: null
    }],
    views: {
      type: Number,
      default: 0
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    deleted_at: {
      type: Date,
      default: "",
    },

  },
);

const video = mongoose.model("Videos", videoSchema);
module.exports = video;
