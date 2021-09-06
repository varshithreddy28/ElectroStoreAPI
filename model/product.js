const mongoose = require('mongoose')
const Review = require('./review')
const date = require('date-and-time');

const present = new Date();

const appError = require("../utilities/expressError")

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Why no bacon?']
    },
    type: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    highlight: {
        type: Boolean,
    },
    colors:
    {
        type: String
    }
    ,
    price: {
        type: Number,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    // image: [
    //     {
    //         type: String,
    //         required: true
    //     }
    // ],
    image: [
        {
            url: {
                type: String,
                required: true
            },
            publicId: {
                type: String,
                required: true
            }
        }
    ],
    discription: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
},
    {
        timestamps: true
    })

productSchema.post('findOneAndDelete', async (data) => {
    if (data.reviews.length) {
        try {
            await Review.deleteMany({ _id: { $in: data.reviews } })
        } catch (error) {
            confirm.log(error.message)
            next(error)
        }

    } else {
        console.log("No reviews to delete")
    }
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product