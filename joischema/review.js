const Joi = require('joi');

const reviewSchema = Joi.object({
    review: Joi.string()
        .min(3)
        .max(500)
        .required()
    ,
    rating: Joi.number()
        .min(1)
        .max(5)
        .required()
})

module.exports = reviewSchema