const mongoose = require('mongoose');

const banShema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateOfBan: {
        type: Date,
        default: Date.now()
    },
    dateOfExpiration: {
        type: Date,
    }
})

module.exports = mongoose.model('Ban', banShema)