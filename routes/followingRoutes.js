const express = require("express");
const router = express.Router();
const User = require("../model/user");
const userApi = require("../model/user-api.js");

router.get("/:username", async (req, res) => {
  try {
    let user = req.session.user;
    let username = req.params.username;
    const currentUser = req.session.user;

    const followingArray = [];
    utente= await userApi.getUser(username);
    const arrayId =utente.following;

    for (const followingId of arrayId) {
      const following = await User.findById(followingId);

      followingArray.push(following);
    }

    res.render("listFollowing.ejs", {
      following: followingArray,
      username: username,
      currentUser: currentUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
