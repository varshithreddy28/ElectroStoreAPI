const Joi = require('joi');

const productSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .required(),
    type: Joi.string()
        .required(),
    quantity: Joi.number()
        .required(),
    isAvailable: Joi.boolean(),
    highlight: Joi.boolean(),
    colors: Joi.string(),
    price: Joi.number()
        .min(0)
        .required(),
    brand: Joi.string()
        .required(),
    image: Joi.array()
        .required(),
    discription: Joi.string(),

    // Updating product
    _id: Joi.string(),
    reviews: Joi.array().items(Joi.string()),
    createdAt: Joi.string(),
    updatedAt: Joi.string(),
    __v: Joi.number(),

    // password: Joi.string()
    //     .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

})
module.exports = productSchema