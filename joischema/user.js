const Joi = require('joi');

const userSchema = Joi.object({
    name:Joi.string()
        .min(3)
        .max(50)
        .required(),
    password:Joi.string()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})')),
    email:Joi.string()
        .email()
        .required()
})

module.exports = userSchema