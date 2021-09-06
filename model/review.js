const mongoose = require('mongoose')
const User = require('./user')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        require: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    rating: {
        type: Number,
        require: true,
        default: 1,
    },
},
    {
        timestamps: true
    }
)

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review