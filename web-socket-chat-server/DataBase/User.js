const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        min: 4,
        max: 40
    },
    permissions: {
        type: String,
        required: true,
        default: 'User'
    },
    date: {
        type: Date,
        default: Date.now()
    }

})

module.exports = mongoose.model('User', userSchema)