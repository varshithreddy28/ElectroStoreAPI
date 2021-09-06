const express = require('express')
const mongoose = require('mongoose')
const Product = require('../model/product')
const User = require('../model/user')
const productSchema = require('../joischema/product')
const Review = require('../model/review')
const cloudinary = require('cloudinary').v2;

const router = express.Router()

const catchError = require('../utilities/catchError')
const appError = require('../utilities/expressError')

const { product } = require('../middleware/validate')

const isLoggedIn = require('../middleware/isLoggedin')
const authenticate = require('../middleware/authentication')

const isAdmin = catchError(async (req, res, next) => {
    const user = await User.findById(req.user.userId)
    if (user.isAdmin) {
        console.log("I am admin")
        next()
    }
    else
        res.json({ message: "Unotherised! Please try again", success: false })
})

// CLoudnary
// cloudinary.config({
//     cloud_name: 'degyw2spa',
//     api_key: '959516473345681',
//     api_secret: 'mXFHfCDdYEMQQk9-za4K6-I9rM4'
// });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});


router.get('/', catchError(async (req, res) => {
    const products = await Product.find().sort({ createdOn: -1 })
    if (products.length > 0) {
        res.json({ success: true, message: products })
    } else {
        res.json({ success: false, message: "No Products Found!!" })
    }
}))

router.post('/new', authenticate, isAdmin, product, catchError(async (req, res) => {
    const product = req.body
    console.log(req.body, "................................... is from route")
    try {
        const newProduct = await new Product({ ...product })
        await newProduct.save()
        console.log("hello success")
        res.json({ newProduct, success: true })
    } catch (error) {
        console.log("hello failure")
        res.json({ message: error.message, success: false })
    }
}))

router.patch('/edit/:id', authenticate, isAdmin, product, catchError(async (req, res) => {
    const updatedProduct = req.body
    const { id } = req.params
    await Product.findByIdAndUpdate(id, { ...updatedProduct })
    const foundProduct = await Product.findById(id)
    if (foundProduct == null) {
        res.json({ message: "Product not found", success: false })
    }
    else
        res.json({ message: "Product updated", success: true })
}))

router.delete('/delete/:id', authenticate, isAdmin, catchError(async (req, res) => {
    const { id } = req.params
    const foundProduct = await Product.findById(id)
    console.log("Delete Route")
    foundProduct.image.forEach(async (img) => {
        console.log(img.publicId)
        try {
            await cloudinary.uploader.destroy(img.publicId, async function (response, data) {
                console.log(data)
                if (data.result == "ok") {
                    console.log("DeletedPDt")
                    await Product.findByIdAndDelete(id)
                    res.json({ message: "Product deleted successfully", success: true })
                }
                else {
                    res.json({ message: "Unable to Delete product Please try again!", success: false })
                }
            });
        } catch (error) {
            res.json({ message: error.message, success: false })
        }
    });

}))

router.get('/:id', catchError(async (req, res) => {
    const { id } = req.params
    const foundProduct = await Product.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'owner'
            }
        })
    if (foundProduct == null) {
        res.json({ message: "Product not found", success: false })
    }
    else
        res.json({ message: foundProduct, success: true })
}))

module.exports = router