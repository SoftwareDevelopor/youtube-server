const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    default: '',
  },
  mobile_number: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    default: ""
  },
  date_of_birth: {
    type: Date,
    default: null
  },
  country: {
    type: String,
    default: ''
  },
  subscribers_count: {
    type: Number,
    default: 0,
    min:0
  },
  subscribed_channels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      default:null
    }
  ],
  channel_description: {
    type: String,
    default: ''
  },
  channel_banner_image: {
    type: String,
    default: ''
  },
  videoIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Videos",
      default: null
    }
  ],
  playlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlists",
      default: null
    }
  ],
  channel_name: {
    type: String,
    default: ''
  },
  increment_points: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date,
    default: ""
  },
  // isPremium: {
  //   type: Boolean,
  //   default: false
  // },
  // premiumExpiry: {
  //   type: Date,
  //   default: null
  // },
  // downloads: [
  //   {
  //     date: { type: Date, required: true },
  //     videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Videos', required: true }
  //   }
  // ],
});

const user = mongoose.model('Users', userSchema);
module.exports = user;