const mongoose = require('mongoose')

const downloadSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: ''
    },
    videoid:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Videos',
        required:[true, 'Video Id is required.']
    },
    

})

const downloads = mongoose.model('Downloads', downloadSchema)

module.exports = downloads