const jwt = require('jsonwebtoken');
const blogModel = require('../models/blogModel')
const mongoose = require('mongoose')


const authentication =  function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        if (!token) token = req.headers["X-API-KEY"];
        if (!token) {
            return res.status(401).send({ status: false, msg: "token must be present" })
        };

        let decodedToken = jwt.verify(token, "PROJECT-1")
        req.loggedInAuthorId = decodedToken.userId
        next()
    }
    catch (error) {
        return res.status(500).send({ status: false, Error: error.message })
    }
}


const authorisation = async function (req, res, next) {
    try {
        let blogid = req.params.blogId

        if(!mongoose.Types.ObjectId.isValid(blogid)) return res.status(400).send({status : false,message : "Invalid format of BlogId"})

        let blog = await blogModel.findOne({_id : blogid})
    
        if (blog) {
            if (blog.authorId != req.loggedInAuthorId) {
                return res.status(403).send({ status: false, msg: 'unauthorised author' })
            } else {
                next()
            }
        }
        else {
            return res.status(404).send({ status: false, msg: "blogId does not exist" })
        }
    }
    catch (error) {
        res.status(500).send({ status: false, Error: error.message })
    }
}



module.exports.authentication = authentication
module.exports.authorisation = authorisation