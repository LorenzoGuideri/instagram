document.addEventListener('DOMContentLoaded', () => {
    const chatArea = document.getElementById('chatArea');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const textEnter = document.getElementById('message-input');
    const socket = io.connect();
    let selectedUserId = null;
    let userId = null;
    let username = null;



    window.selectUser = async (user) => {
        if (selectedUserId) {
            document.getElementById(`user-div-${selectedUserId}`).classList.remove('selected-user');
        }
        selectedUserId = user;
        // console.log("Selected user ID:", selectedUserId); // Debugging line
        document.getElementById(`user-div-${user}`).classList.add('selected-user');
        updateChatHistory();
    };

    fetch('/chat/getUsername')
        .then(response => response.json())
        .then(data => {
            username = data.username;
            // console.log("Username:", username); // Debugging line

            // Move the second fetch inside the .then block of the first fetch
            fetch('/chat/getUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }) // This username should come from the session
            })
                .then(response => response.json())
                .then(data => {
                    userId = data.userId; // Store the user ID for later use
                    username = data.username; // Store the username for later use
                    socket.emit('userConnected', userId); // Emit 'userConnected' event after userId is set

                    // Listen for 'chatMessage' events after userId is set
                    socket.on('chatMessage', (msg) => {
                        // console.log('Received message:', msg);
                        if (msg.receiver === userId || msg.sender === userId) {
                            updateChatHistory();
                        }
                    });
                })
        });

    async function updateChatHistory() {
        // Fetch chat history
        const response = await fetch(`/chat/messages/${userId}/${selectedUserId}`);
        // console.log('Received response:', response);
        const messages = await response.json();
        // console.log('Received messages:', messages);
        // Update chat area
        chatArea.innerHTML = '';
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            if (message.sender === userId) {
                messageElement.classList.add('sent');
            } else {
                messageElement.classList.add('received');
            }
            messageElement.textContent = message.message;
            chatArea.appendChild(messageElement);
        });
    }

    function addMessageToChatArea(messageText) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'sent'); // Add 'sent' class
        messageElement.textContent = messageText;
        chatArea.appendChild(messageElement);
    }

    sendButton.onclick = () => {
        const message = messageInput.value;
        if (message && selectedUserId) {
            // console.log('Sending message:', message);
            socket.emit('chatMessage', {
                sender: userId,
                receiver: selectedUserId,
                message: message
            });
            addMessageToChatArea(message);
            messageInput.value = '';
        }
    };

    textEnter.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendButton.click();
            textEnter.value = "";
        }
    });


    socket.on('chatMessage', (msg) => {
        // console.log('Received message:', msg);
        if (msg.receiver === userId || msg.sender === userId) {
            addMessageToChatArea(msg.message);
        }
    });

});
