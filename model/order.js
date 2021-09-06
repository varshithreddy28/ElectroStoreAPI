const { boolean } = require('joi')
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    details: [{
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
        totalPrice: Number,
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isDelivered: {
        type: Boolean,
        default: false,
        require: true
    },
    success: {
        type: Boolean,
        // default: false,
        require: true
    },
    orderedAt: {
        type: String,
        default: new Date().toLocaleString(),
        require: true
    },
    receipt_url: String
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order