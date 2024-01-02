const express = require("express");
const router = express.Router();

const User = require("../model/user");
const Message = require("../model/message");

router.get("/", async (req, res) => {
  let username = null;
  let currentUser = req.session.user;
  if (currentUser) {
    username = req.session.user.username;
    console.log("Current user:", currentUser);
    try {
      if (username) {

        let users = await User.find();
        
        // Sort users alphabetically
        users.sort((a, b) => (a.username > b.username ? 1 : -1));
        // Remove the current user
        users = users.filter((user) => user.username !== username);

        // Remove users that are not following the current user or not followed by the current user
        users = users.filter(
          (user) =>
            currentUser.following.includes(user._id.toString()) ||
            currentUser.followers.includes(user._id.toString())
        );
        
        const messages = await Message.find();
        res.render("chat", { users, messages, username }); // Pass users data to the EJS template
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      res.status(500).send("Error loading the page");
    }
  }
});
router.get("/getUsername", (req, res) => {
  if (req.session.user && req.session.user.username) {
    res.json({ username: req.session.user.username });
  } else {
    res.json({ username: null });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {

    res.status(500).json({ message: err.message });
  }
});

// Endpoint to handle username and store user ID in session
router.post("/getUser", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      res.json({ userId: user._id, username: user.username }); // Return both user ID and username
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get chat history between two users
router.get("/messages/:senderId/:receiverId", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.senderId, receiver: req.params.receiverId },
        { sender: req.params.receiverId, receiver: req.params.senderId },
      ],
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
