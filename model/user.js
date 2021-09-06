const mongoose = require('mongoose')
const passportMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    isAdmin: {
        type: Boolean,
        default: false,
        require: true
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    history: [{
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            qty: {
                type: Number,
                required: true
            },
            orderedAt: {
                type: String,
                default: new Date().toLocaleString(),
                require: true
            }
        }],
        totalPrice: Number,
        receipt_url: String,
        delivered: {
            type: Boolean,
            default: false
        }
    }],
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }
})

userSchema.plugin(passportMongoose)


const User = mongoose.model('User', userSchema)

module.exports = User