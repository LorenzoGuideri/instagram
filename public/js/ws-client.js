document.addEventListener('DOMContentLoaded', () => {
    checkLocalUser();
    populateUserList();
});

// Initialize Socket.io client
const socket = io();

// Check if a local user is set, otherwise show user setup
function checkLocalUser() {
    const localUser = localStorage.getItem('localUser');
    if (!localUser) {
        document.getElementById('user-setup').style.display = 'block';
    } else {
        document.getElementById('chat-app').style.display = 'flex';
    }
}

// Set local user
document.getElementById('set-user').addEventListener('click', () => {
    const username = document.getElementById('local-username').value;
    localStorage.setItem('localUser', username);
    document.getElementById('user-setup').style.display = 'none';
    document.getElementById('chat-app').style.display = 'flex';
});

// Dummy list of users for demonstration
const users = [{ id: 1, username: 'Alice' }, { id: 2, username: 'Bob' }];
let currentConversationId = null;

// Populate user list
function populateUserList() {
    const userList = document.getElementById('user-list');
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = user.username;
        userElement.onclick = () => startConversationWith(user.id);
        userList.appendChild(userElement);
    });
}

// Start a conversation with a user
function startConversationWith(userId) {
    currentConversationId = 'conversation_' + userId;
    loadMessages(currentConversationId);
    // Additional code to update UI if necessary
}


// Send a new message
document.getElementById('send-message').addEventListener('click', async () => {
    console.log('Send button clicked.');
    const messageInput = document.getElementById('message-input');
    const messageContent = messageInput.value.trim();

    if (!messageContent || !currentConversationId) {
        alert('Please select a user and enter a message.');
        return;
    }

    try {
        await sendMessage(messageContent, currentConversationId);
        messageInput.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
    }
    console.log('Message sent:', messageContent);
});

// Function to send a message to the server
async function sendMessage(content, conversationId) {
    await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            conversationId: conversationId,
            sender: localStorage.getItem('localUser'),
            content: content
        })
    });
}

// Load messages for a conversation
async function loadMessages(conversationId) {
    try {
        const response = await fetch(`/api/messages/${conversationId}`);
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Display messages in the chat area
function displayMessages(messages) {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = ''; // Clear previous messages
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.textContent = message.content;
        messagesContainer.appendChild(messageDiv);
    });
}

// Listen for incoming messages via Socket.io
socket.on('dmMessage', (message) => {
    if (message.conversationId === currentConversationId) {
        displayMessages([message]); // Append the new message
    }
});

