const mongoose = require('mongoose');

const addMinutes = (m) => {
    const date = new Date()
    date.setMinutes(date.getMinutes() + m)
    return date
}

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
        default: addMinutes(10)
    }
})

module.exports = mongoose.model('Ban', banShema)