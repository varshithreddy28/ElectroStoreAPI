const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        qty: {
            type: Number,
            required: true
        }
    }],
    totalPrice: {
        type: Number,
        default: 0
    },
    // owner:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    // },
    success: {
        type: Boolean,
        require: true,
        default: false
    },
    shippingCharges: {
        type: Boolean,
        require: true,
        default: false
    }
})

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart