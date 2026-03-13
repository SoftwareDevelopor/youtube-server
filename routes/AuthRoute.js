const express = require('express');
const { register, login, viewProfile, updateprofile, changepassword, forgotPassword, resetPassword, incrementpoints, subscribe, uploadChannelBanner, getallusers, desubscribe, viewprofileById } = require('../Controllers/AuthController');
const authRouter = express.Router();
const multer = require('multer')
const path = require('path');
const uploads = multer({
    dest: "uploads/users",
});

// Public routes (no authentication required)

module.exports = (app) => {


    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/users')
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Math.random().toString(36).substring(2, 8);
            let imagepath = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + imagepath);
        }
    })

    const uploadimage = multer({ storage: storage });

    let singleimage = uploadimage.single('image');

    let bannerimagupload = uploadimage.single('singleimage');

    authRouter.post('/register', singleimage, register)

    authRouter.post('/login',uploadimage.none(), login)

    authRouter.post('/getallusers', uploadimage.none(), getallusers)

    authRouter.post('/view-profile', uploadimage.none(), viewProfile)

    authRouter.post('/viewProfileById',uploadimage.none(),viewprofileById)

    authRouter.post('/update-profile', singleimage, updateprofile)

    authRouter.post('/upload-channel-banner', bannerimagupload, uploadChannelBanner)

    authRouter.post('/change-password',uploadimage.none(), changepassword)

    authRouter.post('/forgot-password', uploadimage.none(), forgotPassword)

    authRouter.post('/reset-password', uploadimage.none(), resetPassword)

    authRouter.post('/increment-points', uploadimage.none(), incrementpoints)

    authRouter.post('/subscribe', uploadimage.none(),subscribe)

    authRouter.post('/decreasesubscribers', uploadimage.none(), desubscribe)

    // authRouter.post('/hasFreeDownloadToday',hasFreeDownloadToday)

    // authRouter.post('/activatePremium', activatePremium)

    // authRouter.post('/checkPremiumStatus', checkPremiumStatus)

    app.use('/api/auth', authRouter)
}

