const userSchema = require('../joischema/user')
const reviewSchema = require('../joischema/review')
const productSchema = require('../joischema/product')

const appError = require('../utilities/expressError')

const validate = {}

validate.user = (req, res, next) => {
    const { error } = userSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(ele => ele.message).join(',')
        throw new appError(msg, 400)
    }
    else
        next()
}

validate.review = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(ele => ele.message).join(',')
        throw new appError(msg, 400)
    }
    else
        next()
}

validate.product = (req, res, next) => {
    // special schema for Joi must be before mongoose code
    // let colors = req.body.colors.split(',')
    // let images = req.body.image.split(',')
    // req.body.colors = colors // convert colors enter to array
    // req.body.image = images
    console.log(req.body)
    const { error } = productSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(ele => ele.message).join(',')
        console.log(msg)
        throw new appError(msg, 400)
    }
    else
        next()
}

module.exports = validate