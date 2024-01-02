const Comment = require("./comment");
const User = require("./user");

async function getComments(postId) {
  return Comment.find({ postId: postId });
}

async function getComment(id) {
  return await Comment.findById(id);
}

async function createComment(comment) {
  let newComment = new Comment(comment);
  await newComment.save();
  return newComment;
}

async function patchLike(commentId, userId) {
  let comment = await Comment.findById(commentId);
  comment.likes.push(userId);
  await comment.save();
}

// export the new methods
module.exports = {
  getComment,
  getComments,
  createComment,
  patchLike,
};
