const downloads = require("../Models/Download");
const PlaylistSchema = require("../Models/Playlist");
const user = require("../Models/User_Auth");
const video = require("../Models/Video");
const WatchLaterSchema = require("../Models/WatchLater");

exports.uploadvideo = async (req, res) => {

  if (!req || !req.body) {
    const obj = {
      status: false,
      msg: "No video data is provided..!",
      _data: null
    }
    return res.send(obj)
  }
  var existingVideo = await video.findOne({ videotitle: req.body.videotitle, deleted_at: "" })
  if (existingVideo) {
    const obj = {
      status: false,
      msg: "This video is already uploaded & exist..!",
      _data: null
    }
    return res.send(obj)
  }
  const data = req.body
  data.video_tags = data.video_tags.split(",")
  if (req.files) {
    data.thumbnail = req.files.thumbnail[0].filename
    data.videofile = req.files.videofile[0].filename
  }
  let userdata = data.videouploader
  try {
    const insertdata = await video(data)
    let videoid = insertdata._id.toString()
    let userdatabyid = await user.findByIdAndUpdate(
      {
        _id: userdata
      },
      {
        $addToSet: {
          videoIds: videoid
        }
      }
    )
    const result = await insertdata.save()
    const obj = {
      status: true,
      msg: "Uploaded a video..!",
      _data: result,
      image_url: "https://youtube-server-a5ha.onrender.com"
    }
    return res.send(obj)
  } catch (error) {

    return res.send({
      status: false,
      msg: "Something went wrong..!",
      _data: null
    })
  }
};

exports.getallvideos = async (request, response) => {
  try {
    // Fetch all videos and populate the videochannel field to get channel details

    const videos = await video.find().populate("videouploader");

    if (!videos || videos.length === 0) {
      return response.send({
        status: false,
        msg: "No videos found",
        _data: []
      });
    }
    const obj = {
      status: true,
      msg: "Videos fetched successfully",
      _data: videos,
      image_url: "https://youtube-server-a5ha.onrender.com"
    };
    return response.send(obj);
  } catch (error) {

    return response.send({
      status: false,
      msg: "Something went wrong while fetching videos",
      _data: null
    });
  }
}

exports.getSearchedVideos = async (req, res) => {
  try {

    var filter = {}
    if (req.body != undefined) {
      if (req.body.searchedText != undefined || req.body.searchedText != '') {
        filter = {
          $or: [
            {
              videotitle: new RegExp(searchtext, 'i')
            },
            {
              video_tags: new RegExp(searchtext, 'i')
            }
          ]
        }
      }
    }

    var existingvideos = await video.find(filter).populate("videouploader")
    if (existingvideos.length <= 0) {
      const obj = {
        status: false,
        msg: "No any videos found..!",
        _data: []
      }
      return res.send(obj)
    }

    //now check 
    const obj = {
      status: true,
      msg: "Videos found..!",
      _data: existingvideos,
      image_url: "https://youtube-server-a5ha.onrender.com/uploads/videos/"
    }
    return res.send(obj)

  } catch (error) {
    return res.send({
      status: false,
      msg: "Something went wrong..!",
      _data: null
    })
  }
}

exports.viewVideo = async (request, response) => {
  try {
    let id = request.params.id || request.query.id;
    if (!id) {
      return response.send({
        status: false,
        msg: "Missing video id",
        _data: null
      })
    }
    // Atomically increment views and return updated document
    const updated = await video.findById(id).populate("videouploader");
    if (!updated) {
      return response.send({
        status: false,
        msg: "Video not found",
        _data: null
      })
    }

    const obj = {
      status: true,
      msg: "Video Found..!",
      _data: updated,
      image_url: "https://youtube-server-a5ha.onrender.com"
    }
    return response.send(obj)
  }
  catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong",
      _data: null
    })
  }
}

exports.addComments = async (request, response) => {

  try {
    let videoId = request.params.id || request.query.id

    let comments = request.body.comments

    if (!videoId) {
      const obj = {
        status: false,
        msg: "Not sending the video id...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existingVideo = await video.findById(videoId).populate("videouploader")

    if (existingVideo.length <= 0) {
      const obj = {
        status: false,
        msg: "No any videos found...!",
        _data: []
      }
      return response.send(obj)
    }

    let CommentUpdatedVideo = await video.updateOne(
      {
        _id: videoId
      }, {
      $set: comments
    }
    )

    const obj = {
      status: true,
      msg: "Comments Added Successfully...! ",
      _data: CommentUpdatedVideo
    }

    return response.send(obj)

  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }
}

exports.incrementsLike = async (request, response) => {
  try {
    let videoId = request.params.id || request.query.id;
    let videoLikedByUsersIds = request.body.likedByUserIds
    if (!videoId) {
      return response.send({
        status: false,
        msg: "No video ID provided.",
        _data: null
      });
    }
    if (!videoLikedByUsersIds) {
      const obj = {
        status: false,
        msg: "No user id provided...!",
        _data: ''
      }
      return response.send(obj)
    }
    let existingVideo = await video.findById(videoId)
    let existingUsers = await user.findById(videoLikedByUsersIds)
    if (!existingVideo) {
      const obj = {
        status: false,
        msg: "Not available this video...! Please upload this video...!",
        _data: null
      }
      return response.send(obj)
    }
    if (!existingUsers) {
      const obj = {
        status: false,
        msg: "Not available this user...! Please register or login with this user account...!",
        _data: null
      }
      return response.send(obj)
    }
    if (existingVideo.likedBy.includes(videoLikedByUsersIds)) {
      const obj = {
        status: false,
        msg: "You are already liked this video...!",
        _data: null
      }
      return response.send(obj)
    }

    let updatedVideoWithLikedByUserAndIncrementedLikeCount = await video.findByIdAndUpdate(
      {
        _id: videoId
      },
      {
        $inc: { likes: 1 }
      },
      {
        new: true
      }
    )
    let updatedVideoWithLikedByUser = await video.findByIdAndUpdate(
      {
        _id: videoId
      },
      {
        $addToSet: {
          likedBy: videoLikedByUsersIds
        }
      },
      {
        new: true
      }
    ).populate('likedBy')

    const obj = {
      status: true,
      msg: "Thanking you a lot for like the video..!",
      _data: updatedVideoWithLikedByUser
    }
    return response.send(obj)
  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }
};

exports.decrementsLike = async (request, response) => {
  try {
    let videoId = request.params.id || request.query.id;
    let videodisLikedByUsersIds = request.body.dislikedByUserIds
    if (!videoId) {
      return response.send({
        status: false,
        msg: "No video ID provided.",
        _data: null
      });
    }
    if (!videodisLikedByUsersIds) {
      const obj = {
        status: false,
        msg: "No user id provided...!",
        _data: ''
      }
      return response.send(obj)
    }
    let existingVideo = await video.findById(videoId)
    let existingUsers = await user.findById(videodisLikedByUsersIds)
    if (!existingVideo) {
      const obj = {
        status: false,
        msg: "Not available this video...! Please upload this video...!",
        _data: null
      }
      return response.send(obj)
    }
    if (!existingUsers) {
      const obj = {
        status: false,
        msg: "Not available this user...! Please register or login with this user account...!",
        _data: null
      }
      return response.send(obj)
    }
    if (!existingVideo.likedBy.includes(videodisLikedByUsersIds)) {
      const obj = {
        status: false,
        msg: "You are already disliked the video. So, you not able to dislike the video...!",
        _data: null
      }
      return response.send(obj)
    }
    let updatedVideoWithLikedByUser = await video.findByIdAndUpdate(
      {
        _id: videoId
      },
      {
        $inc: { likes: -1 },
        $pull: {
          likedBy: videodisLikedByUsersIds
        }
      },
      {
        new: true
      }
    ).populate('likedBy')

    const obj = {
      status: true,
      msg: "Ook You disliked the video..!",
      _data: updatedVideoWithLikedByUser
    }
    return response.send(obj)
  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }
};

exports.createPlaylist = async (request, response) => {

  try {
    if (!request || !request.body) {
      const obj = {
        status: false,
        msg: "No video data is provided to the playlist...!",
        _data: null
      }
      return response.send(obj)
    }

    let data = request.body

    data.userId = request.params.id || request.query.id

    if (request.files) {
      data.image = request.files.image[0].filename
    }

    let insertPlaylistData = await PlaylistSchema(data)

    await user.findByIdAndUpdate(
      {
        _id: insertPlaylistData.userId
      },
      {
        $addToSet: {
          playlist: insertPlaylistData._id.toString()
        }
      }
    ).populate('playlist')
    let playlistresult = await insertPlaylistData.save()
    const obj = {
      status: true,
      msg: "This Playlist Created & Videos Added Successfully...!",
      _data: playlistresult,
      imagepath: "https://youtube-server-a5ha.onrender.com/uploads/videos/playlists/"
    }
    return response.send(obj)
  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }
}

exports.viewAllPlaylistByUserId = async (request, response) => {
  try {
    let id = request.params.id || request.query.id
    if (!id) {
      const obj = {
        status: false,
        msg: "Not passing the user id...!",
        _data: ''
      }
      return response.send(obj)
    }
    let userdata = await user.findById(id).populate('subscribed_channels').populate('videoIds').populate('playlist')
    let playlistdata = await PlaylistSchema.find({ userId: id, deleted_at: null }).populate('videoids')
    if (!userdata) {
      const obj = {
        status: false,
        msg: "No any user found...!",
        _data: ''
      }
      return response.send(obj)
    }
    if (!playlistdata) {
      const obj = {
        status: false,
        msg: "No any playlist available...!",
        _data: []
      }
      return response.send(obj)
    }
    const obj = {
      status: true,
      msg: "User playlist found successfully...!",
      _data: playlistdata,
      imagepath: "https://youtube-server-a5ha.onrender.com/uploads/videos/playlists/"
    }
    return response.send(obj)
  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }
}

exports.updatePlaylist = async (request, response) => {
  try {

    let playlistid = request.params.id || request.query.id
    let videoids = request.body.videoids

    if (!playlistid) {
      const obj = {
        status: false,
        msg: "Not passing the playlist id to update it...!",
        _data: ''
      }
      return response.send(obj)
    }

    if (!videoids) {
      const obj = {
        status: false,
        msg: "Not sending the video in the playlist...!",
        _data: ''
      }
      return response.send(obj)
    }

    let updateplaylist = await PlaylistSchema.findByIdAndUpdate(
      {
        _id: playlistid
      },
      {
        $addToSet: {
          videoids: videoids
        }
      },
      {
        new: true
      }
    ).populate('videoids').populate('userId')

    if (!updateplaylist) {
      const obj = {
        status: false,
        msg: "Playlist not found...!",
        _data: null
      }
      return response.send(obj)
    }

    const obj = {
      status: true,
      msg: "Playlist updated successfully...!",
      _data: updateplaylist,
      imagepath: "https://youtube-server-a5ha.onrender.com/uploads/videos/playlists/"
    }
    return response.send(obj)

  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }
}

exports.viewAllVideosInPlaylist = async (request, response) => {
  try {

    let playlistid = request.params.id || request.query.id
    if (!playlistid) {
      const obj = {
        status: false,
        msg: "Not passing the playlist id in URL...!",
        _data: ''
      }
      return response.send(obj)
    }
    let viewallvideoinplaylist = await PlaylistSchema.findOne({ _id: playlistid, deleted_at: null }).populate('userId').populate('videoids')
    if (!viewallvideoinplaylist) {
      const obj = {
        status: false,
        msg: "No any videos available in this playlist...!",
        _data: []
      }
      return response.send(obj)
    }
    const obj = {
      status: true,
      msg: "These videos are available in this playlist...!",
      _data: viewallvideoinplaylist,
      imagepath: "https://youtube-server-a5ha.onrender.com/uploads/videos/playlists/"
    }
    return response.send(obj)
  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }
}

exports.deleteVideosInPlaylist = async (request, response) => {

  try {
    let playlistid = request.params.id || request.query.id
    let videoid = request.body.videoid

    if (!playlistid) {
      const obj = {
        status: false,
        msg: "Not passing the playlist id...!",
        _data: ''
      }
      return response.send(obj)
    }

    if (!videoid) {
      const obj = {
        status: false,
        msg: "Not passing the video id...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existedplaylist = await PlaylistSchema.findById(playlistid)
    if (!existedplaylist) {
      const obj = {
        status: false,
        msg: "Playlist Not available...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existedvideo = await video.findById(videoid)
    if (!existedvideo) {
      const obj = {
        status: false,
        msg: "Video Not available...!",
        _data: ''
      }
      return response.send(obj)
    }


    let deletevideoinplaylist = await PlaylistSchema.findOneAndUpdate(
      {
        _id: playlistid
      },
      {
        $pull: {
          videoids: videoid
        }
      }
    )

    const obj = {
      status: true,
      msg: "Video Deleted in Playlist Successfully...!",
      _data: deletevideoinplaylist
    }
    return response.send(obj)

  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }

}

exports.deletePlaylist = async (request, response) => {
  try {
    let playlistid = request.params.id || request.query.id

    if (!playlistid) {
      const obj = {
        status: false,
        msg: "Not passing the playlist id...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existplaylist = await PlaylistSchema.findById(playlistid)
    if (!existplaylist) {
      const obj = {
        status: false,
        msg: "Playlist Not found...!",
        _data: ''
      }
      return response.send(obj)
    }

    let deleteplaylist = await PlaylistSchema.findOneAndUpdate(
      {
        _id: playlistid
      },
      {
        deleted_at: new Date()
      }
    ).populate('videoids').populate('userId')

    const obj = {
      status: true,
      msg: "Playlist Deleted Successfully...!",
      _data: deleteplaylist
    }
    return response.send(obj)

  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }
}

exports.deleteVideo = async (request, response) => {
  try {

    let videoidtodelete = request.params.id || request.query.id

    if (!videoidtodelete) {
      const obj = {
        status: false,
        msg: "Not passing the video id to be delete...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existingVideo = await video.findById({ _id: videoidtodelete, deleted_at: null })

    if (!existingVideo) {
      const obj = {
        status: false,
        msg: "No any video available to delete...!",
        _data: null
      }
      return response.send(obj)
    }

    let deletedVideo = await video.updateOne(
      {
        _id: videoidtodelete
      },
      {
        $set: {
          deleted_at: new Date()
        }
      }
    )
    if (deletedVideo) {
      const obj = {
        status: true,
        msg: "Video Deleted Successfully...!",
        _data: deletedVideo
      }
      return response.send(obj)
    }

  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }
}

exports.addVideosInwatchLater = async (request, response) => {

  try {

    let videoidInWatchlater = request.body.VIDEOID

    let userid = request.params.id || request.query.id

    if (!userid) {
      const obj = {
        status: false,
        msg: "Not passing the user details...!",
        _data: ''
      }
      return response.send(obj)
    }

    if (!videoidInWatchlater) {
      const obj = {
        status: false,
        msg: "No any video id is passing to the watch later...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existingvideo = await video.findById(videoidInWatchlater).populate('videouploader')
    // console.log("existed video:-- ",existingvideo)
    if (!existingvideo) {
      const obj = {
        status: false,
        msg: "Video Not Available....! ",
        _data: {}
      }
      return response.send(obj)
    }

    let existinguser = await user.findById(userid)
    // console.log("\nexisted user:-- ",existinguser)

    if (!existinguser) {
      const obj = {
        status: false,
        msg: "User Not Available....! ",
        _data: {}
      }
      return response.send(obj)
    }

    let existwatchlater = await WatchLaterSchema.findOne({ userId: userid })

    let existWatchlaterVideo = await WatchLaterSchema.findOne({ videos: videoidInWatchlater })

    let existingWatchLater = await WatchLaterSchema.findOne({ userId: userid, videos: videoidInWatchlater })

    if (!existWatchlaterVideo) {
      const obj = {
        status: false,
        msg: "Video does not found in this watch later...!",
        _data: null
      }
      return response.send(obj)
    }

    if (existwatchlater) {
      if (!existingWatchLater) {
        let updatewatchlaterbyuserid = await WatchLaterSchema.findOneAndUpdate(
          {
            userId: userid
          },
          {
            $addToSet: {
              videos: videoidInWatchlater
            }
          }
        ).populate('userId').populate('videos')
        const obj = {
          status: true,
          msg: "Video Update in the Watch Later...!",
          _data: updatewatchlaterbyuserid
        }
        return response.send(obj)
      }
    }

    if (existingWatchLater) {
      const obj = {
        status: false,
        msg: "Video Is Already Added in Watch later...!",
        _data: ''
      }
      return response.send(obj)

    }

    let data = {
      userId: userid,
      videos: videoidInWatchlater
    }

    let videoinsertwatchlater = await WatchLaterSchema(data)
    let result = await videoinsertwatchlater.save()

    const obj = {
      status: true,
      msg: "Video Added Successfully...!",
      _data: result
    }
    return response.send(obj)

  } catch (error) {
    return response.send({
      status: false,
      msg: "Somethg went wrong...!",
      _data: null
    })
  }
}

exports.updateWatchlater = async (request, response) => {
  try {
    let userid = request.params.id || request.query.id

    if (!userid) {
      const obj = {
        status: false,
        msg: "Not passing the user details...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existUser = await user.findById(userid)
    if (!existUser) {
      const obj = {
        status: false,
        msg: "User Not Available....!",
        _data: ''
      }
      return response.send(obj)
    }

    let videoidInWatchlater = request.body.videoid

    if (!videoidInWatchlater) {
      const obj = {
        status: false,
        msg: "No any video id is passing to the watch later...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existingvideo = await video.findById(videoidInWatchlater).populate('videouploader')

    if (!existingvideo) {
      const obj = {
        status: false,
        msg: "Video Not Available....! ",
        _data: {}
      }
      return response.send(obj)
    }

    let existedWatchLater = await WatchLaterSchema.findOne({ userId: userid, videos: videoidInWatchlater })
    if (!existedWatchLater) {
      const obj = {
        status: false,
        msg: "Video Not Found In this watch later....!",
        _data: ''
      }
      return response.send(obj)
    }

    let updatedwatchlater = await WatchLaterSchema.findOneAndUpdate(
      {
        userId: userid
      },
      {
        $pull: {
          videos: videoidInWatchlater
        }
      }
    ).populate('videos').populate('userId')

    if (!updatedwatchlater) {
      const obj = {
        status: false,
        msg: "Watch later not found for this user...!",
        _data: null
      }
      return response.send(obj)
    }

    const obj = {
      status: true,
      msg: "Video removed from watch later successfully...!",
      _data: updatedwatchlater
    }

    return response.send(obj)

  } catch (error) {

    return response.send({
      status: false,
      msg: "Somethg went wrong...!",
      _data: null
    })
  }

}

exports.viewAllVideosInWatchLater = async (request, response) => {
  try {
    let userid = request.params.id || request.query.id

    if (!userid) {
      const obj = {
        status: false,
        msg: "Not passing the user id details....!",
        _data: ''
      }
      return response.send(obj)
    }

    let existinguser = await user.findById(userid)

    if (!existinguser) {
      const obj = {
        status: false,
        msg: "User not available...!",
        _data: null
      }
      return response.send(obj)
    }

    let existingwatchleter = await WatchLaterSchema.findOne({ userId: userid }).populate({
      path: 'videos',
      populate: {
        path: 'videouploader'
      }
    }).populate('userId')

    if (!existingwatchleter) {
      const obj = {
        status: false,
        msg: "Watch Later with this user Not Available....!",
        _data: null
      }
      return response.send(obj)
    }

    const obj = {
      status: true,
      msg: "Watch Later with this User Found Successfully....!",
      _data: existingwatchleter,
      imagepath: "https://youtube-server-a5ha.onrender.com/uploads/"
    }

    return response.send(obj)

  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong....!",
      _data: null
    })
  }
}

exports.viewLikedVideos = async (request, response) => {
  try {
    let userid = request.params.id || request.query.id
    if (!userid) {
      const obj = {
        status: false,
        msg: "Not passing the user id...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existeduser = await user.findById(userid)
    if (!existeduser) {
      const obj = {
        status: false,
        msg: "User Not Found...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existinglikedvideos = await video.find({ likedBy: userid }).populate('videouploader').populate('likedBy')

    if (!existinglikedvideos) {
      const obj = {
        status: false,
        msg: "Liked Videos with this user Not Available....!",
        _data: null
      }
      return response.send(obj)
    }

    const obj = {
      status: true,
      msg: "Liked Videos with this User Found Successfully....!",
      _data: existinglikedvideos,
      imagepath: "https://youtube-server-a5ha.onrender.com/uploads/"
    }

    return response.send(obj)

  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong....!",
      _data: null
    })
  }
}

exports.downloadVideo = async (request, response) => {
  try {

    let userid = request.params.id || request.query.id
    let videoid = request.body.videoid

    if (!userid) {
      const obj = {
        status: false,
        msg: "Not passing the user id....!",
        _data: ''
      }
      return response.send(obj)
    }

    if (!videoid) {
      const obj = {
        status: false,
        msg: "Not passing the video id...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existeduser = await user.findById(userid)

    let existingvideo = await video.findById(videoid)

    if (!existeduser) {
      const obj = {
        status: false,
        msg: "User Not Found...!",
        _data: ''
      }
      return response.send(obj)
    }

    if (!existingvideo) {
      const obj = {
        status: false,
        msg: "Video Not Available....! ",
        _data: {}
      }
      return response.send(obj)
    }

    let existeddownloadvideo = await downloads.findOne({ videoid: videoid })
    if (existeddownloadvideo) {

      const obj = {
        status: false,
        msg: "Video Already Downloaded...!",
        _data: ''
      }
      return response.send(obj)
    }


    const inserDownloadData = await downloads({ userId: userid, videoid: videoid })
    const savedata = await inserDownloadData.save()
    const obj = {
      status: true,
      msg: "Video Downloaded Successfully...!",
      _data: savedata
    }
    return response.send(obj)

  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }
}

exports.viewDownloadedVideo = async (request, response) => {
  try {
    let userid = request.params.id || request.query.id
    if (!userid) {
      const obj = {
        status: false,
        msg: "Not passing the user id.....!",
        _data: ''
      }
      return response.send(obj)
    }

    let existinguser = await user.findById(userid)
    if (!existinguser) {
      const obj = {
        status: false,
        msg: "User Not available...!",
        _data: ''
      }
      return response.send(obj)
    }

    let existeddownloads = await downloads.find({ userId: userid })
    if (!existeddownloads) {
      const obj = {
        status: false,
        msg: "Downloaded Videos Not Found with this user...!",
        _data: []
      }
      return response.send(obj)
    }

    const obj = {
      status: true,
      msg: "Downloaded Videos Founded Successfully with this user...!",
      _data: existeddownloads
    }
    return response.send(obj)

  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong...!",
      _data: null
    })
  }
}

exports.incrementVideoViews = async (request, response) => {
  try {
    let videoId = request.params.id || request.query.id
    if (!videoId) {
      const obj = {
        status: false,
        msg: "No video ID provided.",
        _data: null
      }
      return response.send(obj)
    }

    let updatedVideo = await video.findByIdAndUpdate(
      {
        _id: videoId
      },
      {
        $inc: { views: 1 }
      },
      {
        new: true
      }
    ).populate('videouploader')

    if (!updatedVideo) {
      const obj = {
        status: false,
        msg: "Video not found",
        _data: null
      }
      return response.send(obj)
    }

    const obj = {
      status: true,
      msg: "Video view count incremented successfully..!",
      _data: updatedVideo,
      image_url: "https://youtube-server-a5ha.onrender.com"
    }
    return response.send(obj)
  } catch (error) {
    return response.send({
      status: false,
      msg: "Something went wrong while incrementing video views",
      _data: null
    })
  }
}