const express = require('express')
const mongoose = require('mongoose')
const Product = require('../model/product')
const Review = require('../model/review')
const User = require('../model/user')
const reviewSchema = require('../joischema/review')

const router = express.Router()

const catchError = require('../utilities/catchError')
const appError = require('../utilities/expressError')

const { review } = require('../middleware/validate')
const isLoggedIn = require('../middleware/isLoggedin')
const authenticate = require('../middleware/authentication')
const isReviewOwner = require('../middleware/isReview')

router.post('/:id/review/new', authenticate, review, catchError(async (req, res) => {
    const { id } = req.params
    const { review, rating } = req.body

    const foundProduct = await Product.findById(id)
    const newReview = new Review({
        review: review,
        owner: req.user.userId,
        rating
    })
    foundProduct.reviews.push(newReview)
    console.log(foundProduct.reviews)
    newReview.save()
    foundProduct.save()
    res.json({ message: foundProduct, success: true })
}))

router.patch('/:id/review/edit/:revId', authenticate, isReviewOwner, review, catchError(async (req, res) => {
    const { id, revId } = req.params
    const { review, rating } = req.body
    const rev = await Review.findById(revId)
    const pdt = await Product.findById(id)
    if (rev != null && pdt != null) {
        await Review.findByIdAndUpdate(revId, { review: review, rating: rating })
        res.json({ message: "Review Updated", success: true })
    }
    else {
        res.json({ message: "Cannot Update please try again", success: false })
    }

}))

router.delete('/:id/review/delete/:revId', authenticate, isReviewOwner, catchError(async (req, res) => {
    const { id, revId } = req.params
    const pdt = await Product.findByIdAndUpdate(id, { $pull: { reviews: revId } })
    // console.log(pdt)
    await Review.findByIdAndDelete(revId)
    res.json({ message: "Review Deleted", success: true })
}))


module.exports = router