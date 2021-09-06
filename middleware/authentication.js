const express = require('express')
const jwt = require('jsonwebtoken')
const catchError = require('../utilities/catchError')

// Middle ware for checking a valid token and assingning result to req.user(the method we did on own)
const auth = async (req, res, next) => {
    const bearer = req.headers['authorization']
    if (bearer) {

        // console.log(bearer)
        const token = bearer.split(' ')[1] // Taking token from header
        // console.log(token)
        if (!token) {
            return res.json({ success: false, message: "No Authorization" }).send(401)

        }

        // Checking valid token
        // If valid returns the userId
        try {

            const data = await jwt.verify(token, process.env.JWT_SECRET)
            // if(req.user)

            req.user = data
            next()

            // if(data.userId==req.user._id){
            // req.user = data
            // next()
            // }
            // else{
            //     res.json({message:"The Token didn't verified Please login again!",success:false})
            // }
            // }
            // else {
            //     res.json({ message: "Please login again!", success: false })
            // }

        } catch (error) {
            res.status(400).json({ message: `${error.message}`, success: false })
        }
    }
    else {


        return res.json({ success: false, message: "No Authorization!Access Denied" }).status(401)
    }



}

module.exports = auth