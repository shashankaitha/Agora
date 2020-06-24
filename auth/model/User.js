const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        max: 1024,
        min: 4

    },
    email: {
        type: String,
        require: true,
        max: 255,
        min: 6
    
    },
    password: {
        type: String,
        max: 1024,
        min: 6
    },
    date: {
        type: Date,
        default :Date.now

    },
    active: {
        type: Boolean,
        default: false
    }
} );

module.exports = mongoose.model('User', userSchema);