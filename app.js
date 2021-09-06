require('dotenv/config') //envfile

const express = require('express')
const path = require('path')
const app = express()

const mongoose = require('mongoose')
const cors = require('cors')

app.use(cors())
app.use(express.static(path.join(__dirname, '/joiSchemas')))
app.use(express.static(path.join(__dirname, '/utilities')))

const User = require('./model/user')

const passport = require('passport')
const passportLocal = require('passport-local')
const cookieParser = require('cookie-parser')
app.use(cookieParser(process.env.EXPRESS_SECRET))
// SESSION
const session = require('express-session')
app.use(session({
    secret: process.env.EXPRESS_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,  // setting cookie expiery date for 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// Passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportLocal(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const uri = process.env.MONGO_URL
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
    .then(() => {
        console.log("Connected to DB!")
    })
    .catch((error) => {
        console.log("Error in connecting to database!", error.message)
    })

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Validation
const catchError = require('./utilities/catchError')
const appError = require('./utilities/expressError')


// Routes 
const product = require("./routers/product")
const review = require('./routers/review')
const user = require('./routers/user')

app.use('/api/v1/product', product)
app.use('/api/v1/product', review)
app.use('/api/v1', user)

app.all('*', (req, res, next) => {
    next(new appError("Invalid URL", 404))
})

app.use((err, req, res, next) => {
    //err = next
    const { message = "Something went wrong please try again after some time!", status = 500 } = err //if no status code then it will set to 500 by default
    // console.log(err.message, err.status, status)
    const msg = err.message.replace(/["]/g, ''); //To get neat message check with and without opertaion
    res.json({ success: false, message: `${msg}` })
})

const port = process.env.PORT || 3000

app.listen(port, (req, res) => {
    console.log(`Connected to port ${port}`)
})