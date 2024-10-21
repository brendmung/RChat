# RChat - Real-Time Random Chat Application

A modern web-based chat application that allows users to have anonymous conversations with random partners. Built with Node.js, Socket.IO, and styled with Tailwind CSS, RChat provides an iMessage-inspired interface for seamless communication.

## Live Demo

Try out RChat live at: [a-random-chat.glitch.me](https://a-random-chat.glitch.me)

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/a-random-chat)

## Features

- 💬 Real-time messaging with random chat partners
- 🎨 Modern UI design
- 👤 Simple username and gender-based registration
- 🖼️ Image sharing support (up to 5MB)
- ⌨️ Typing indicators
- ↩️ Message reply functionality
- 🔄 "Next Partner" feature to find new chat partners
- ⏰ Automatic inactive user detection
- 📱 Fully responsive design

## Tech Stack

- **Frontend:**
  - HTML5
  - Tailwind CSS
  - Socket.IO Client
  - Font Awesome Icons
- **Backend:**
  - Node.js
  - Express
  - Socket.IO

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/brendmung/rchat.git
cd rchat
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Quick Start with Glitch

You can quickly remix this project on Glitch:
1. Click the "Remix on Glitch" button above
2. Wait for the project to load in Glitch's editor
3. Your copy of the app will automatically start running

## Usage

1. Enter your username and select your gender
2. Click "Start Chatting" to be matched with a random partner
3. Once matched, you can:
   - Send text messages
   - Share images
   - Reply to specific messages
   - See when your partner is typing
   - Click "Next" to find a new partner

## Configuration

The following environment variables can be set:
- `PORT`: Server port (default: 3000)
- `INACTIVITY_TIMEOUT`: User inactivity timeout in milliseconds (default: 5 minutes)

## Security Features

- Image size limitation (5MB max)
- Input sanitization for messages
- Inactivity detection and automatic disconnection
- Maximum username length restriction

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the classic Omegle chat platform
- UI design influenced by Apple's iMessage
- Built with modern web technologies and best practices

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
