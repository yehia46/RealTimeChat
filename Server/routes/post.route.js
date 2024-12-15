const express = require("express")
const postRoute = express.Router()
const multer = require('multer')

const controllers = require('../controllers/post')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_")
        cb(null, sanitizedFilename)
    }    
})

const upload = multer({ storage: storage })

postRoute.get('/get-all', controllers.getAllPosts)
postRoute.get('/get-posts-by-author-email/:email', controllers.getPostsByAuthorEmail)
postRoute.post('/create-post', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), controllers.createPost)
postRoute.put('/edit/', controllers.editPost)
postRoute.delete('/delete/:id', controllers.deletePost)


module.exports = postRoute