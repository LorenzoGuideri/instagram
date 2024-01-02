const express = require("express");
const router = express.Router();
const User = require("../model/user");
const Post = require("../model/post");

const userApi = require("../model/user-api");
const postApi = require("../model/post-api");
const commentApi = require("../model/comment-api");

router.get("/", async (req, res) => {
  try {
    let user = req.session.user;
    let username = user ? user.username : null;
    const currentUser = req.session.user;

    let postArray = [];

    const currentUserPosts = await userApi.getPosts(currentUser.username);
    postArray = postArray.concat(currentUserPosts);

    if (user && user.following) {
      for (const followingId of user.following) {
        const followingUser = await User.findById(followingId);
        let posts = await userApi.getPosts(followingUser.username);
        postArray = postArray.concat(posts);
      }
    }

    postArray.sort((a, b) => b.createdAt - a.createdAt);

    let commentsArray = []

    for (const post of postArray) {
      const comments = await commentApi.getComments(post._id)
      commentsArray = commentsArray.concat(comments)
    }

    res.render("index.ejs", {
      username: username,
      posts: postArray,
      currentUser: currentUser,
      currentUserId: currentUser._id,
      comments: commentsArray,
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(e.status ?? 500);
  }
});


router.post("/:postId/like", async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.session.user._id;

    const { likesCount, liked } = await postApi.patchLike(postId, userId);

    res.json({ likes: likesCount, liked: liked });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing like");
  }
});

module.exports = router;
