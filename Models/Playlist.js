const mongoose = require("mongoose");

const AddToPlaylistSchema = new mongoose.Schema(
  {
    name:{
        type:String,
        required:[true,'PlayList Name is required'],
        default:''
    },
    description:{
        type:String,
        required:[true,'Playlist Description is required'],
        default:''
    },
    image:{
        type:String,
        default:"",
        
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default:''
    },
    videoids: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Videos",
      default:''
    }],
    addedAt: {
      type: Date,
      default: Date.now,
    },
    deleted_at:{
        type:Date,
        default:''
    }
  }
);
const PlaylistSchema=mongoose.model("Playlists",AddToPlaylistSchema)
module.exports = PlaylistSchema