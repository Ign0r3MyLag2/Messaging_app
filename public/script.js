let currentUser = ''; // Store the logged-in user's username
let selectedUser = ''; // Store the selected user to chat with
let currentChatUser = null;

// Set current user after login
function setCurrentUser(username) {
  currentUser = username;
  document.getElementById('current-username').textContent = username;
  fetchUsers();
  document.getElementById('login').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
}

// Login User
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert('Please enter both username and password');
    return;
  }

  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setCurrentUser(username);
      } else {
        document.getElementById('login-error').style.display = 'block';
      }
    })
    .catch(err => console.error('Login Error:', err));
}

// Fetch list of users
function fetchUsers() {
  fetch(`/api/users?username=${currentUser}`)
    .then(response => response.json())
    .then(data => {
      if (data.users) {
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '';
        data.users.forEach(user => {
          const userItem = document.createElement('li');
          userItem.textContent = user.username;
          userItem.onclick = () => startChat(user.username);
          usersList.appendChild(userItem);
        });
      } else {
        alert('Error fetching users');
      }
    })
    .catch(error => console.error('Error fetching users:', error));
}

// Start chat with a selected user
function startChat(user) {
  selectedUser = user;
  currentChatUser = user;
  document.getElementById('chat-header').textContent = `Chat with ${selectedUser}`;
  fetchMessages();
}

// Fetch messages for the current conversation
function fetchMessages() {
  if (!selectedUser) return;

  fetch(`/api/messages?user1=${currentUser}&user2=${selectedUser}`)
    .then(response => response.json())
    .then(data => {
      if (data.messages) {
        displayMessages(data.messages);
      } else {
        alert('Error fetching messages');
      }
    })
    .catch(error => console.error('Error fetching messages:', error));
}

// Display fetched messages
function displayMessages(messages) {
  const messageBox = document.getElementById('message-box');
  messageBox.innerHTML = '';

  messages.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(msg.sender_username === currentUser ? 'my-message' : 'other-message');
    messageDiv.textContent = `${msg.sender_username}: ${msg.content}`;
    messageBox.appendChild(messageDiv);
  });

  messageBox.scrollTop = messageBox.scrollHeight;
}

// Send a new message
function sendMessage() {
  const content = document.getElementById('msg').value;

  if (!content.trim()) return;

  const messageData = {
    sender_username: currentUser,
    receiver_username: selectedUser,
    content: content
  };

  fetch('/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messageData)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        fetchMessages();
        document.getElementById('msg').value = '';
      } else {
        alert('Failed to send message');
      }
    })
    .catch(error => console.error('Error sending message:', error));
}

// Log Out
function logout() {
  currentUser = '';
  selectedUser = '';
  currentChatUser = null;
  document.getElementById('login').style.display = 'block';
  document.getElementById('chat').style.display = 'none';
}

// Toggle between login and register sections
function toggleRegister() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('register').style.display = 'block';
}

function toggleLogin() {
  document.getElementById('login').style.display = 'block';
  document.getElementById('register').style.display = 'none';
}

// Register User
function register() {
  const username = document.getElementById('new-username').value;
  const password = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (!username || !password || !confirmPassword) {
    alert('Please fill in all fields.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  const userData = {
    username,
    password
  };

  fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Registration successful!');
        toggleLogin();
      } else {
        document.getElementById('register-error').style.display = 'block';
      }
    })
    .catch(error => console.error('Error registering user:', error));
}

setInterval(() => {
  if (currentChatUser) {
    fetchMessages();
  }
}, 5000);
