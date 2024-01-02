const express = require("express");
const router = express.Router();
const User = require("../model/user");
const userApi = require("../model/user-api.js");

router.get("/:username", async (req, res) => {
  try {
    let user = req.session.user;
    let username = req.params.username;
    const currentUser = req.session.user;

    const followerArray = [];
    utente= await userApi.getUser(username);
    const arrayId =utente.followers;

    for (const followerId of arrayId) {
      const follower = await User.findById(followerId);

      followerArray.push(follower);
    }

    res.render("listFollowers.ejs", {
      followers: followerArray,
      username: username,
      currentUser: currentUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
