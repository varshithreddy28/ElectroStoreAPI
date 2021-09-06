const express = require('express')
const Product = require('../model/product')
const Review = require('../model/review')
const User = require('../model/user')
const Order = require('../model/order')
const Cart = require('../model/cart')
const Address = require('../model/address')

const jwt = require('jsonwebtoken')
const passport = require('passport')
const authenticate = require('../middleware/authentication')

const router = express.Router()

const catchError = require('../utilities/catchError')
const { user } = require('../middleware/validate')
const isLoggedin = require('../middleware/isLoggedin')
const stripe = require('stripe')(process.env.STRIPE_PAYMENT);
const { v4: uuidv4 } = require('uuid');

const isAdmin = catchError(async (req, res, next) => {
    const user = await User.findById(req.user.userId)
    if (user.isAdmin)
        next()
    else
        res.json({ message: "Unotherised! Please try again", success: false })
})

// Register
router.post('/user/register', user, catchError(async (req, res) => {
    const { email, name, password } = req.body
    const user = new User({
        username: name,
        email: email
    })
    const newUser = await User.register(user, password)
    // Loggin the user
    req.login(newUser, async (err) => {
        if (!err) {
            const userId = newUser._id
            const foundUser = await User.findById(userId)
            // 
            const cart = await new Cart().save()
            console.log(cart)
            await User.findByIdAndUpdate(userId, { foundUser, cart })
            // 
            console.log({ foundUser, cart })
            const userName = newUser.username
            const token = await jwt.sign({ userId }, process.env.JWT_SECRET, {
                expiresIn: '365d'
            })
            res.json({ success: true, message: "User Registered succesfully", userName, token })
        }
        else {
            return next(err)
        }
    })
}))


router.get('/user/login', (req, res) => {
    res.json({ message: "Username/Password didn't matched", success: false })
})

router.post('/user/login', passport.authenticate('local', { failureRedirect: '/api/v1/user/login' }), catchError(async (req, res) => {
    const userId = req.user._id
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '365d'
    })
    const { iat, exp } = await jwt.decode(token)
    res.json({ message: "Logged in Succesfully", token, success: true })
}))

router.get('/user/logout', (req, res) => {
    req.logOut()
    res.json({ message: "Logged Out Succesfully", success: true })
})

router.post("/user/cart/local/add", authenticate, catchError(async (req, res) => {
    const itemsCart = req.body
    const foundUser = await User.findById(req.user.userId)

    if (foundUser.cart) {

        const foundCart = await Cart.findById(foundUser.cart)
        itemsCart.map(async (item) => {
            const foundProduct = await Product.findById(item.id)

            const pos = foundCart.items.findIndex(objInItems => new String(objInItems.productId).trim() === new String(item.id).trim());
            console.log(pos)
            if (pos == -1) {
                let items = []
                items = foundCart.items
                const product = { productId: item.id, qty: item.qty }
                items.unshift(product)
                foundCart.totalPrice += (foundProduct.price * item.qty)
                const totalPrice = foundCart.totalPrice
                console.log(totalPrice, "is total price")

                await Cart.findByIdAndUpdate(foundUser.cart, { items, totalPrice: totalPrice })
                res.json({ success: true, message: foundCart })
            }
            else {
                let items = []
                items = foundCart.items
                items[pos].qty += item.qty
                foundCart.totalPrice += (foundProduct.price * item.qty)
                const totalPrice = foundCart.totalPrice
                console.log(totalPrice, "Is total price")

                await Cart.findByIdAndUpdate(foundUser.cart, { items, totalPrice: totalPrice })
                res.json({ success: true, message: foundCart })
            }
        })

    }
}))

router.post('/user/cart/:id/add', authenticate, catchError(async (req, res) => {
    console.log(req.params.id)
    const foundUser = await User.findById(req.user.userId)
    const foundProduct = await Product.findById(req.params.id)
    if (!foundProduct || !foundUser)
        return res.json({ success: false, message: "Please no product found!" })
    if (foundUser.cart) {
        const foundCart = await Cart.findById(foundUser.cart)
        const pos = foundCart.items.findIndex(objInItems => new String(objInItems.productId).trim() === new String(req.params.id).trim());
        console.log(pos)
        if (pos == -1) {
            let items = []
            items = foundCart.items
            const product = { productId: req.params.id, qty: 1 }
            items.unshift(product)
            foundCart.totalPrice += foundProduct.price
            const totalPrice = foundCart.totalPrice
            await Cart.findByIdAndUpdate(foundUser.cart, { items, totalPrice: totalPrice })
            res.json({ success: true, message: foundCart })
        }
        else {
            let items = []
            items = foundCart.items
            items[pos].qty += 1
            foundCart.totalPrice += foundProduct.price
            const totalPrice = foundCart.totalPrice
            await Cart.findByIdAndUpdate(foundUser.cart, { items, totalPrice: totalPrice })
            res.json({ success: true, message: foundCart })
        }
    }
    else {
        const cart = new Cart()
        const product = { productId: req.params.id, qty: 1 }
        cart.items.unshift(product)
        cart.totalPrice = foundProduct.price
        cart.save()
        await User.findByIdAndUpdate(req.user.userId, { ...foundUser, cart })
        console.log(foundUser, "is found user")
        res.json({ success: true, message: cart })
    }
    res.json({ success: true, message: `Unable to process your request please try again!` })
}))



// 
router.delete('/user/cart/:id/delete', authenticate, catchError(async (req, res) => {
    const foundUser = await User.findById(req.user.userId)
    const foundProduct = await Product.findById(req.params.id)
    const foundCart = await Cart.findById(foundUser.cart)
    // from git hub
    const pos = foundCart.items.findIndex(objInItems => new String(objInItems.productId).trim() === new String(req.params.id).trim());
    if (foundCart.items[pos].qty == 1) {
        let items = []
        items = foundCart.items
        // console.log(items)
        items.splice(pos, 1);
        foundCart.totalPrice -= foundProduct.price
        const totalPrice = foundCart.totalPrice
        await Cart.findByIdAndUpdate(foundUser.cart, { items, totalPrice: totalPrice })
        res.json({ success: true, message: foundCart })
    }
    else if (foundCart.items[pos].qty != 1) {
        let items = []
        items = foundCart.items
        items[pos].qty -= 1
        // console.log(items)
        foundCart.totalPrice -= foundProduct.price
        const totalPrice = foundCart.totalPrice
        await Cart.findByIdAndUpdate(foundUser.cart, { items, totalPrice: totalPrice })
        res.json({ success: true, message: foundCart })
    }
    else if (pos == -1)
        return res.json({ success: false, message: "Item is not present please try again!" })
}))

router.post('/user/address', authenticate, catchError(async (req, res) => {
    const foundUser = await User.findById(req.user.userId)
    const newAddress = new Address({ ...req.body })
    newAddress.save()
    foundUser.address = newAddress
    foundUser.save()
    res.json({ message: "Address added success fully", success: true })
}))

router.post('/user/placeorder', authenticate, catchError(async (req, res) => {
    const { token, address } = req.body

    const foundUser = await User.findById(req.user.userId)
    if (!foundUser.address) {
        const newAddress = new Address({ ...address })
        newAddress.save()
        foundUser.address = newAddress
        foundUser.save()
        console.log("NEW ADDRESS ADDED")
    }
    const foundCart = await Cart.findById(foundUser.cart).lean()
        .populate({
            path: 'items',
            populate: {
                path: 'productId'
            }
        })
    if (!foundCart)
        return res.json({ success: false, message: "Please add items to cart" })
    if (!foundUser.address)
        return res.json({ success: false, message: "Please add Address to continue" })

    stripe.customers.create({
        email: token.email,
        source: token.id,
        name: token.card.name,
    })
        .then((customer) => {
            // Adding charges to customer
            return stripe.charges.create({
                amount: foundCart.totalPrice * 100,     // Charing
                description: `Purchase of Products`,
                currency: 'INR',
                customer: customer.id,
                receipt_email: token.email
            });
        })
        .then(async (charge) => {
            // let history = foundUser.history
            // history.unshift({ items: foundCart.items, totalPrice: foundCart.totalPrice, receipt_url: charge.receipt_url })
            // await User.findByIdAndUpdate(req.user.userId, { history })
            // console.log()
            // Update items in the DB after buying
            const details = { items: foundCart.items, totalPrice: foundCart.totalPrice }
            const order = new Order({ details, user: foundUser, isDelivered: false, receipt_url: charge.receipt_url })
            let history = foundUser.history
            history.unshift({ _id: order._id, items: foundCart.items, totalPrice: foundCart.totalPrice, receipt_url: charge.receipt_url })
            await User.findByIdAndUpdate(req.user.userId, { history })
            console.log(order._id, history._id)
            order.save()
            res.json({ success: true, message: { receipt_url: charge.receipt_url, status: charge.status } })  // If no error occurs
        })
        .catch((err) => {
            res.json({ success: false, message: err.message })       // If some error occurs
        });
}))

router.get('/user/history', authenticate, catchError(async (req, res) => {
    const foundUser = await User.findById(req.user.userId)
        .populate({
            path: 'history',
            populate: {
                path: 'items',
                populate: {
                    path: 'productId'

                }
            }
        })
    if (foundUser.history.length == 0)
        return res.json({ success: true, message: null })
    res.json({ success: true, message: foundUser.history })
}))

router.get('/user/cart', authenticate, catchError(async (req, res) => {
    const foundUser = await User.findById(req.user.userId)
    const foundCart = await Cart.findById(foundUser.cart)
        .populate({
            path: 'items',
            populate: {
                path: 'productId'
            }
        })
    if (!foundCart) {
        return res.json({ message: "No items in cart!", success: true })
    }
    res.json({ success: true, message: foundCart })
}))

router.get('/user/allorders', authenticate, isAdmin, catchError(async (req, res) => {
    const orders = await Order.find()
        .populate({
            path: 'details',
            populate: {
                path: 'items',
                populate: {
                    path: 'productId'
                }
            }
        }).populate({
            path: "user",
            populate: {
                path: "address"
            }
        })
    if (!orders)
        return res.json({ success: false, message: "No new orders" })
    else
        return res.json({ success: true, message: orders })
}))

// For user details
router.get('/user/details', authenticate, catchError(async (req, res) => {
    const foundUser = await User.findById(req.user.userId)
        .populate({
            path: 'cart',
            populate: {
                path: "items",
                populate: {
                    path: "productId"
                }
            }
        }).populate('orders').populate('address')
    res.json({ message: foundUser, success: true }).status(200)
}))


// PAMENT

router.post('/payment', authenticate, catchError(async (req, res) => {
    console.log("I am In")
    const foundUser = await User.findById(req.user.userId)

    const { product, token, address } = req.body
    if (!foundUser.address) {
        const newAddress = new Address({ ...address })
        newAddress.save()
        foundUser.address = newAddress
        foundUser.save()
        console.log("NEW ADDRESS ADDED")
    }
    // Creating Customer
    stripe.customers.create({
        email: token.email,
        source: token.id,
        name: token.card.name,
    })
        .then((customer) => {
            // Adding charges to customer
            return stripe.charges.create({
                amount: product.price * 100,     // Charing
                description: `Purchase of ${product.name}`,
                currency: 'INR',
                customer: customer.id,
                receipt_email: token.email
            });
        })
        .then(async (charge) => {
            // Adding product to user history
            const details = { items: [{ productId: product._id, qty: 1 }], totalPrice: product.price }
            const order = new Order({ details, user: foundUser, isDelivered: false, success: true, receipt_url: charge.receipt_url })
            let history = foundUser.history
            const items_ = [{ productId: product._id }]
            history.unshift({ _id: order._id, items: items_, totalPrice: product.price, receipt_url: charge.receipt_url })
            await User.findByIdAndUpdate(req.user.userId, { history })
            console.log(order._id)
            order.save()

            res.json({ success: true, message: { receipt_url: charge.receipt_url, status: charge.status } })  // If no error occurs
        })
        .catch((err) => {
            res.json(err.message)       // If some error occurs
        });
}))

router.patch('/order/update/:id', authenticate, isAdmin, catchError(async (req, res) => {
    const foundOrder = await Order.findById(req.params.id)
    await Order.findByIdAndUpdate(req.params.id, { isDelivered: true })
    const foundUser = await User.findById(foundOrder.user)
    let history = foundUser.history
    const index = history.findIndex((item) => item._id == req.params.id)
    history[index].delivered = true
    await User.findByIdAndUpdate(foundOrder.user, { history })
    res.json({ success: true, message: "Order Updated!" })
}))

module.exports = router