const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const path = require("path");
const Post = require("../model/post");

router.use(fileUpload());

// get functions from
const postApi = require("../model/post-api");
const userApi = require("../model/user-api");

// POST /posts
router.get("/create", async (req, res) => {
  let username = null;

  if (req.session.user) username = req.session.user.username;

  try {
    if (username) {
      res.render("post", {
        username: req.session.user.username,
        currentUser: req.session.user,
        message: ""
      });
    } else {
      res.redirect("/login");
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

router.post("/create", async (req, res) => {
  let username = req.session.user.username;
  try {
    const { title } = req.body;
    if (!req.files || Object.keys(req.files).length == 0) {
      return res.render("post", {
        username: req.session.user.username,
        currentUser: req.session.user,
        message: "Please upload something"
      });
    }
    if (!title || title.trim() === "") {
      return res.render("post", {
        username: req.session.user.username,
        currentUser: req.session.user,
        message: "Please add a title"
      });
    }
    const file = req.files.data;
    if (file.size > 2097152) {
      return res.render("post", {
        username: req.session.user.username,
        currentUser: req.session.user,
        message: "File too big! (max 2MB)"
      });
    }
    if (
      !["image/gif", "image/jpeg", "image/png", "image/jpg"].includes(
        file.mimetype
      )
    ) {
      return res.render("post", {
        username: req.session.user.username,
        currentUser: req.session.user,
        message: "Please upload a picture/GIF"
      });
    }
    const uploadPath = path.join(
      __dirname,
      "..",
      "public",
      "user-data",
      req.session.user.username,
      file.md5 + "." + file.mimetype.split("/")[1]
    );
    await file.mv(uploadPath);
    // console.log("file uploaded as: ", uploadPath);
    let newPost = await postApi.createPost({
      content: path.join(
        "user-data",
        req.session.user.username,
        file.md5 + "." + file.mimetype.split("/")[1]
      ),
      title: title,
      createdBy: username,
      likes: [],
      comments: [],
    });
    await userApi.addPost(req.session.user.username, newPost._id);
    res.redirect("/");
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// GET /posts/:id
// router.get("/:id", async (req, res) => {
//   let postId = req.params.id;

//   try {
//     let post = await postApi.getPost(postId);
//     res.render("view-post", { post });
//   } catch (e) {
//     res.sendStatus(e.status ?? 500); // TODO consider sending 499 instead of e.status
//   }
// });

module.exports = router;
