const Post = require("./post");
const User = require("./user");

function getPost(id) {
  return Post.findById(id);
}

async function createPost(post) {
  let newPost = new Post(post);
  await newPost.save();
  return newPost._id;
}

async function patchLike(postId, userId) {
  let post = await Post.findById(postId);

  const likeIndex = post.likes.indexOf(userId);
  let liked;
  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1);
    liked = false;
  } else {
    post.likes.push(userId);
    liked = true;
  }

  await post.save();

  return { likesCount: post.likes.length, liked: liked };
}

async function getComments(postId) {
  return Post.findById(postId).populate("comments");
}

// export the new methods
module.exports = {
  getPost,
  createPost,
  patchLike,
};
