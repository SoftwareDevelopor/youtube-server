const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config()
const mongoose = require("mongoose");
const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://vidshare-khaki.vercel.app'); // Allow only your frontend origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Specify allowed methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Specify allowed headers
  next();
});

// Increase payload limits to allow large video metadata or accidental large JSON bodies.
// For actual video file uploads we rely on multer, but some clients may send
// large JSON fields (not recommended). Tune these values as needed.
app.use(bodyparser.json({limit: 125000000})) //
app.use(express.json({limit: 125000000})) // Increase JSON payload limit
app.use(express.urlencoded({ extended: true, limit: 125000000 })) // Increase URL-encoded payload limit
app.use(cors({
  origin: ['https://vidshare-khaki.vercel.app/','https://vidshare-khaki.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))


// Serve uploads folder statically
app.use("/uploads/users", express.static('uploads/users'));
app.use("/uploads/videos/thumbnails", express.static('uploads/videos/thumbnails'));
app.use("/uploads/videos/videofile", express.static('uploads/videos/videofile'));
app.use("/uploads/videos/playlists", express.static('uploads/videos/playlists'));

app.get("/", (request, response) => {
  response.send("Youtube API Working !");
});

require('./routes/AuthRoute.js')(app);
require('./routes/VideoRoute.js')(app);

const dburl = process.env.DB_URL;
// Connect to MongoDB first, then start the HTTP server (with socket.io)
mongoose
  .connect(dburl)
  .then(() => {
    console.log("MongoDB connection established successfully!");
    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

