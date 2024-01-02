const express = require("express");
const router = express.Router();

const commentApi = require("../model/comment-api");
const postApi = require("../model/post-api");

router.post('/:id/create', async (req, res) => {
    let { content } = req.body;
    let post = await postApi.getPost(req.params.id);

    try {
        let newComment = await commentApi.createComment({
            postId: post._id,
            user: req.session.user.username,
            content: content,
            likes: [],
        });

        post.comments.push(newComment);
        await post.save();

        res.redirect('/')
    } catch (e) {
        res.sendStatus(500);
    }
});

module.exports = router;
