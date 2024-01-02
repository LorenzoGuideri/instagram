const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
const socketIo = require("socket.io");
const cors = require("cors");
const http = require("http");
const User = require("./model/user");
const Post = require("./model/post");
// initialize io

app.use(cors());

// EJS setup
app.set("view engine", "ejs");

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));

// Express session
app.use(
  session({
    secret: "secret", // replace with a real secret in production
    resave: true,
    saveUninitialized: true,
  })
);

// MongoDB connection
mongoose
  .connect("mongodb://mongo:27017/PIG", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// DB fill

const Message = require("./model/message");

const users = [
  { username: "Lorenzo" },
  { username: "Matilda" },
  { username: "Adriana" },
];

users.forEach(async (userData) => {
  // check if user already exists, save only if it doesn't
  let user = await User.findOne({ username: userData.username });
  if (!user) {
    User.create({ username: userData.username }).then(
      console.log(`Created user ${userData.username}`)
    );
  }
});

const AuthCheck = (req, res, next) => {
  if (req.session && req.session.user) {
    // console.log("Logged");
    next();
  } else {
    // console.log("Not logged");
    res.redirect("/login");
  }
};

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const indexRoutes = require("./routes/indexRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const followersRoutes = require("./routes/followersRoutes");
const followingRoutes = require("./routes/followingRoutes");
const commentRoutes = require("./routes/commentRoutes");

// Use routes and authentication
app.use("/posts", AuthCheck);
app.use("/chat", AuthCheck);
app.use("/profile", AuthCheck);
app.use("/followers", AuthCheck);
app.use("/following", AuthCheck);
app.use("/login", authRoutes);
app.use("/posts", postRoutes);
app.use("/chat", chatRoutes);
app.use("/profile", userRoutes);
app.use("/followers", followersRoutes);
app.use("/following", followingRoutes);
app.use("/", AuthCheck);
app.use("/", indexRoutes);
app.use("/comment/", AuthCheck);
app.use("/comment/", commentRoutes);

app.use((req, res, next) => {
  res
    .status(404)
    .render("404", {
      username: req.session.user ? req.session.user.username : null,
    });
});

const path = require("path");

app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

const chatUsers = {};

let socketServer = http.createServer(app);
let io = socketIo(socketServer);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Store user ID and socket ID when a user connects
  socket.on("userConnected", (userId) => {
    chatUsers[userId] = socket.id;
  });

  // Handling chat messages
  socket.on("chatMessage", async (msg) => {
    try {
      console.log("Received message:", msg);
      const newMessage = new Message(msg);
      await newMessage.save();
      console.log("Message saved:", newMessage);
      // Send message to receiver
      const receiverSocketId = chatUsers[msg.receiver]; // Use chatUsers instead of users
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("chatMessage", newMessage);
      }
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove user from chatUsers object when they disconnect
    for (let userId in chatUsers) {
      if (chatUsers[userId] === socket.id) {
        delete chatUsers[userId];
        break;
      }
    }
  });
});

async function emptyPostsCollection() {
  try {
    await Post.deleteMany({});
    console.log("posts deleted");

    await User.updateMany({}, { $set: { posts: [] } });
    console.log("user posts deleted");
  } catch (error) {
    console.error("Error deleting posts:", error);
  }
}

// Start the server
emptyPostsCollection().then(() => {
  const PORT = process.env.PORT || 3000;
  let server = socketServer.listen(PORT);

  server.on("listening", function () {
    console.log(
      "Express server listening on http://localhost:" + server.address().port
    );
  });
});
