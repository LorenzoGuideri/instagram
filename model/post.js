// models/Post.js

const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
