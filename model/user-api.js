const User = require("./user.js");
const Post = require("./post.js");

async function getUser(username) {
  try {
    let user = await User.findOne({ username: username });
    return user;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function getPosts(username) {
  const userWithPosts = await User.findOne({ username: username }).populate(
    "posts"
  );
  return userWithPosts.posts ?? [];
}

async function getPictures(username) {
  let user = await User.findOne({ username: username });
  return user.picture ?? undefined;
}

async function editPicture(username, picture) {
  let user = await User.findOne({ username: username });
  user.picture = picture;
  await user.save();
}

// follow and unfollow functions

async function followUser(userNik, followUserNik) {
  const user = await User.findOne({ username: userNik });

  const followUser = await User.findOne({ username: followUserNik });

  // const userObject = await User.findById(followUser._id);

  if (!user || !followUser) {
    throw new Error("User or followUser not found");
  }

  if (!user.following.includes(followUser._id)) {
    user.following.push(followUser._id);
    await user.save();
  }

  if (!followUser.followers.includes(user._id)) {
    followUser.followers.push(user._id);
    await followUser.save();
  }
}

async function unfollowUser(userId, unfollowUserId) {
  const user = await User.findOne({ username: userId });
  const unfollowUser = await User.findOne({ username: unfollowUserId });

  if (!user || !unfollowUser) {
    throw new Error("User or unfollowUser not found");
  }

  if (user.following.includes(unfollowUser._id)) {
    await User.findByIdAndUpdate(user._id, {
      $pull: { following: unfollowUser._id },
    });
  }

  if (unfollowUser.followers.includes(user._id)) {
    await User.findByIdAndUpdate(unfollowUser._id, {
      $pull: { followers: user._id },
    });
  }
}

async function addPost(userName, postId) {
  const user = await User.findOne({ username: userName });
  user.posts.push(postId);
  await user.save();
}

// removed useless function

// export the new methods
module.exports = {
  getUser,
  getPosts,
  getPictures,
  editPicture,
  followUser,
  unfollowUser,
  addPost,
};
