const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({
    billing: {
        name: {
            type: String,
            required: true
        },
        addressLane: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        zip: {
            type: String,
            required: true
        },
    },
    shipping: {
        name: {
            type: String,
            required: true
        },
        addressLane: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        zip: {
            type: String,
            required: true
        },
    },
})

const Address = mongoose.model('Address', addressSchema)

module.exports = Address