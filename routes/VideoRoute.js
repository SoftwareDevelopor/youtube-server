const express = require("express");
const multer = require('multer')
const path = require('path');
const { uploadvideo, getallvideos, viewVideo, getSearchedVideos, addComments, incrementsLike, decrementsLike, viewAllPlaylistByUserId, updatePlaylist, createPlaylist, viewAllVideosInPlaylist, deleteVideo, addVideosInwatchLater, updateWatchlater, viewAllVideosInWatchLater, deletePlaylist, deleteVideosInPlaylist, downloadVideo, viewLikedVideos, viewDownloadedVideo, incrementVideoViews } = require("../Controllers/VideoController");
const videoroute = express.Router();
const videoUploads = multer({
  dest: "uploads/videos/videofile",
});
const thumbnailUploads = multer({
  dest: "uploads/videos/thumbnails",
});

const playlistimage = multer({
  dest: "uploads/videos/playlists",
});

module.exports = (app) => {

  // Configure multer for video uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname == 'videofile') {
        cb(null, 'uploads/videos/videofile');
      }
      else if (file.fieldname == 'thumbnail') {
        cb(null, 'uploads/videos/thumbnails');
      }
      else if (file.fieldname == 'image') {
        cb(null, 'uploads/videos/playlists');
      }
      else {
        cb(new Error('Invalid field name'), null);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Math.random().toString(36).substring(2, 8);
      // console.log('Original filename:', file.originalname);
      let ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);

    }
  });

  // Set a file size limit for uploads (here 1GB). Adjust as necessary or use
  // an environment variable for production use.
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1024 * 30 } // 30GB limit for video files
  });

  const uploadFields = upload.fields([
    { name: 'videofile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]);

  videoroute.post("/uploadvideo", uploadFields, uploadvideo);

  videoroute.post('/getallvideos', upload.none(), getallvideos)

  videoroute.post("/view-video", upload.none(), viewVideo)

  videoroute.post("/search-videos", upload.none(), getSearchedVideos)

  videoroute.post("/update-comments", upload.none(), addComments)

  videoroute.post('/incrementlikes', upload.none(), incrementsLike)

  videoroute.post('/decrement-like', upload.none(), decrementsLike)

  videoroute.post('/create-playlist', uploadFields, createPlaylist)

  videoroute.post('/view-all-playlists', upload.none(), viewAllPlaylistByUserId)

  videoroute.post('/update-playlist', upload.none(), updatePlaylist)

  videoroute.post('/delete-playlist', upload.none(), deletePlaylist)

  videoroute.post('/delete-video-in-playlist', upload.none(), deleteVideosInPlaylist)

  videoroute.post('/view-all-videos-in-playlist', upload.none(), viewAllVideosInPlaylist)

  videoroute.post('/increment-views', upload.none(), incrementVideoViews)

  videoroute.post('/delete-video/:id', upload.none(), deleteVideo)

  videoroute.post('/watch-later/add-video-watch-later', upload.none(), addVideosInwatchLater)

  videoroute.post('/watch-later/view-all-videos-watch-later', upload.none(), viewAllVideosInWatchLater)

  videoroute.post('/watch-later/update-watch-later', upload.none(), updateWatchlater)

  videoroute.post('/liked-videos/view', upload.none(), viewLikedVideos)

  videoroute.post('/download-video/create', upload.none(), downloadVideo)

  videoroute.post('/download-video/view', upload.none(), viewDownloadedVideo)

  app.use('/api/video', videoroute)

}


// videoroute.post("/downloadandsave", downloadAndSaveVideo);