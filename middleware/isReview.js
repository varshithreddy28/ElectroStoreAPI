const catchError = require('../utilities/catchError')
const Review = require('../model/review')
const User = require('../model/user')

const isReviewOwner = catchError(async (req, res, next) => {
    const { id, revId } = req.params
    const foundReview = await Review.findById(revId)
    console.log(!foundReview.owner._id.equals(req.user.userId) || !req.user.isAdmin)
    if (!foundReview.owner._id.equals(req.user.userId)) {
        const foundUser = await User.findById(req.user.userId)
        console.log(foundUser)

        if (foundUser.isAdmin) {
            return next()
        }
        else {
            return res.json({ message: "Authorization falied please try again!!!", success: false })
        }
    }
    next()
})

module.exports = isReviewOwner