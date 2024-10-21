const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  maxHttpBufferSize: 1e7 // 10 MB
});

const path = require('path');

app.use(express.static('public'));

class User {
  constructor(id, username, gender, socket) {
    this.id = id;
    this.username = username;
    this.gender = gender;
    this.socket = socket;
    this.partnerId = null;
    this.lastActivityTimestamp = Date.now();
    this.state = 'waiting';
    this.isSearching = false;
  }

  updateActivity() {
    this.lastActivityTimestamp = Date.now();
  }

  isInactive(timeoutMs) {
    return Date.now() - this.lastActivityTimestamp > timeoutMs;
  }
}

class ChatManager {
  constructor() {
    this.users = new Map();
    this.waitingUsers = [];
    this.inactivityTimeout = 5 * 60 * 1000; // 5 minutes
  }

  addUser(user) {
    this.users.set(user.id, user);
  }

  removeUser(id) {
    const user = this.users.get(id);
    if (user) {
      this.users.delete(id);
      this.removeFromWaiting(id);
      return user;
    }
    return null;
  }

  addToWaiting(id) {
    const user = this.users.get(id);
    if (user && !this.waitingUsers.includes(id) && user.state === 'waiting' && user.isSearching) {
      this.waitingUsers.push(id);
    }
  }

  removeFromWaiting(id) {
    this.waitingUsers = this.waitingUsers.filter(userId => userId !== id);
  }

  findMatch(user) {
    while (this.waitingUsers.length > 0) {
      const partnerId = this.waitingUsers.shift();
      if (partnerId !== user.id && this.users.has(partnerId)) {
        const partner = this.users.get(partnerId);
        if (!partner.isInactive(this.inactivityTimeout) && partner.state === 'waiting' && partner.isSearching) {
          user.partnerId = partnerId;
          partner.partnerId = user.id;
          user.state = 'chatting';
          partner.state = 'chatting';
          user.isSearching = false;
          partner.isSearching = false;
          return partner;
        }
      }
    }
    this.addToWaiting(user.id);
    return null;
  }

  disconnectPartner(id) {
    const user = this.users.get(id);
    if (user && user.partnerId) {
      const partner = this.users.get(user.partnerId);
      if (partner) {
        partner.partnerId = null;
        partner.state = 'waiting';
        user.partnerId = null;
        user.state = 'waiting';
        return partner;
      }
    }
    return null;
  }

  checkInactiveUsers() {
    for (const [id, user] of this.users) {
      if (user.isInactive(this.inactivityTimeout)) {
        this.handleInactiveUser(id);
      }
    }
  }

  handleInactiveUser(id) {
    const user = this.removeUser(id);
    if (user) {
      user.socket.emit('inactive');
      user.socket.disconnect(true);
      const partner = this.disconnectPartner(id);
      if (partner) {
        partner.socket.emit('partner left');
      }
    }
  }
}

const chatManager = new ChatManager();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  let currentUser = null;

  socket.on('register', ({ username, gender }) => {
    username = username.trim().substring(0, 20); // Limit username length
    if (!username) {
      socket.emit('registration error', 'Username cannot be empty');
      return;
    }
    currentUser = new User(socket.id, username, gender, socket);
    chatManager.addUser(currentUser);
    currentUser.isSearching = true;
    findMatchForUser(currentUser);
  });

  socket.on('chat message', (data) => {
  if (currentUser && currentUser.partnerId && currentUser.state === 'chatting') {
    currentUser.updateActivity();

    const messageId = generateUniqueId();
    const message = {
      id: messageId,
      type: data.type,
      sender: currentUser.username,
      message: data.message || null,
      image: data.image || null,
      replyTo: data.replyTo || null // Include replyTo field for both text and images
    };

    io.to(currentUser.partnerId).emit('chat message', message);
  }
});


function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15);
}


  socket.on('next partner', () => {
    if (currentUser) {
      currentUser.updateActivity();
      handleNextPartner(currentUser.id);
    }
  });

  socket.on('typing', (isTyping) => {
    if (currentUser && currentUser.partnerId && currentUser.state === 'chatting') {
      currentUser.updateActivity();
      io.to(currentUser.partnerId).emit('partner typing', isTyping);
    }
  });

  socket.on('disconnect', () => {
    handleDisconnect(socket.id);
  });
});

// Function to validate image data
function isValidImage(dataUrl) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5 MB

  // Extract the MIME type and data from the Data URL
  const matches = dataUrl.match(/^data:(image\/\w+);base64,/);
  if (!matches) return false;

  const mimeType = matches[1];
  if (!allowedTypes.includes(mimeType)) return false;

  // Calculate the size of the image in bytes
  const base64Data = dataUrl.split(',')[1];
  const sizeInBytes = (base64Data.length * 3) / 4 - (base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0);
  if (sizeInBytes > maxSize) return false;

  return true;
}

function findMatchForUser(user) {
  const partner = chatManager.findMatch(user);
  if (partner) {
    startChat(user, partner);
  } else {
    user.socket.emit('waiting');
  }
}

function startChat(user1, user2) {
  user1.socket.emit('chat start', { partnerName: user2.username });
  user2.socket.emit('chat start', { partnerName: user1.username });
}

function handleNextPartner(userId) {
  const user = chatManager.users.get(userId);
  if (user) {
    const oldPartner = chatManager.disconnectPartner(userId);
    if (oldPartner) {
      oldPartner.socket.emit('partner left');
    }
    user.isSearching = true;
    user.socket.emit('waiting');
    findMatchForUser(user);
  }
}

function handleDisconnect(userId) {
  console.log('User disconnected:', userId);
  const user = chatManager.removeUser(userId);
  if (user) {
    const partner = chatManager.disconnectPartner(userId);
    if (partner) {
      partner.socket.emit('partner left');
    }
  }
}

// Check for inactive users every minute
setInterval(() => chatManager.checkInactiveUsers(), 60000);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
