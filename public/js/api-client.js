// We want to send requests to the server from the client side

let api = (function () {
  function makeRequest(method, url, body = null) {
    return fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    }).then((res) => res.json());
  }

  async function getPost(id) {
    return makeRequest("GET", `/posts/${id}`);
  }

  async function getPosts() {
    return makeRequest("GET", "/");
  }

  async function getUser(username) {
    return makeRequest("GET", `/user/${username}`);
  }

  async function createPost(post) {
    return makeRequest("POST", "/post/create", post);
  }

  async function getMessages(user) {
    return makeRequest("GET", `/chat/${user}`);
  }

  async function followUser(userId) {
    return makeRequest("POST", `/profile/follow/${userId}`);
  }

  async function unfollowUser(userId) {
    return makeRequest("POST", `/profile/unfollow/${userId}`);
  }

  // Put other messages methods

  async function patchLike(postId, like) {
    return makeRequest("PATCH", `/post/${postId}/like`, like);
  }

  async function patchUser(userId, user) {
    return makeRequest("PATCH", `/user/${userId}`, user);
  }

  async function addMessage(message) {
    return makeRequest("POST", "/message/create", message);
  }

  async function getMessages(user) {
    return makeRequest("GET", `/messages/${user}`);
  }

  return {
    getPost,
    getPosts,
    getUser,
    createPost,
    patchLike,
    patchUser,
    addMessage,
    getMessages,
    followUser,
    unfollowUser,
  };
})();
