const mongoose = require('mongoose');

const messageShema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String
    },
    date: { 
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Message', messageShema)