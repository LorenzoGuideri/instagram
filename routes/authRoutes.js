const express = require("express");
const session = require("express-session");
const router = express.Router();
const User = require("../model/user.js");
const userApi = require("../model/user-api.js");

router.get("/", async (req, res) => {
  if (req.session && req.session.user) {
    res.redirect("/")
  }
  else{
    res.render("login", { loginError: false });
  }
});

router.post("/", async (req, res) => {
  const { username } = req.body; // Extracting username from the request body

  try {
    let user = await userApi.getUser(username); // Await the resolution of getUser

    if (user) {
      req.session.user = user; // Set the session user to the user object
      res.redirect("/");
    } else {
      res.render("login", { loginError: true });
    }
  } catch (error) {
    res.render("login", { loginError: true });
  }
});

module.exports = router;
