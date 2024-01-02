//modify profile settings

const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const router = express.Router();
const User = require("../model/user");

const { getPosts } = require("../model/user-api");

const userApi = require("../model/user-api.js");

router.use(fileUpload());

// GET /profile/:username
router.get("/:username", async (req, res) => {
  try {
    const profileUser = await User.findOne({ username: req.params.username });
    const currentUser = req.session.user;

    if (!profileUser) {
      return res.status(404).send("Profile user not found");
    }

    console.log("USER" + profileUser);

    // Check if currentUser is following profileUser
    let isFollowing = profileUser.followers.includes(currentUser._id);

    let posts = await getPosts(req.params.username);

    res.render("profile.ejs", {
      currentUser: currentUser,
      profileUserId: profileUser._id,
      visitedUsername: profileUser.username,
      username: currentUser.username,
      followersCount: profileUser.followers.length,
      followingCount: profileUser.following.length,
      isFollowing: isFollowing,
      posts: posts,
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/follow/:accountId", async (req, res) => {
  try {
    await userApi.followUser(req.session.user.username, req.params.accountId);

    const updatedUser = await User.findOne({
      username: req.session.user.username,
    });
    req.session.user = updatedUser;

    res.json({ success: true, message: "Followed successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error in following user" });
  }
});

router.post("/unfollow/:userId", async (req, res) => {
  try {
    await userApi.unfollowUser(req.session.user.username, req.params.userId);

    const updatedUser = await User.findOne({
      username: req.session.user.username,
    });
    req.session.user = updatedUser;

    res.json({ success: true, message: "Unfollowed successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error in unfollowing user" });
  }
});

router.post("/:userId/changePFP", async (req, res) => {
  try {
    const file = req.files.profilePicture;

    // Check if file exists and has the expected properties
    if (!file || !file.md5 || !file.mimetype) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid file format" });
    }
    if (!req.files || Object.keys(req.files).length == 0) {
      return res.status(400).send("Please upload something");
    }
    if (file.size > 10000000) {
      return res
        .status(400)
        .send("The file is too big (max 10 MB, try to compress it)");
    }
    if (
      !["image/gif", "image/jpeg", "image/png", "image/jpg"].includes(
        file.mimetype
      )
    ) {
      return res.status(400).send("The file is not an image");
    }

    const uploadPath = path.join(
      __dirname,
      "..",
      "public",
      "user-data",
      req.session.user.username,
      "profilePicture" + "." + "png"
    );

    await file.mv(uploadPath);
    console.log("file uploaded as: ", uploadPath);
    res.redirect("/profile/" + req.session.user.username);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error in changing PFP" });
  }
});

module.exports = router;
