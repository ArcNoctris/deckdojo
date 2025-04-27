# DeckDojo.app - YuGiOh Game Tracker & Deck Builder

DeckDojo is a web application for YuGiOh players to track their games (Life point/Timer), manage their decks, and access card information. The app includes features like a deck builder, game statistics, and card database integration.

## Features

- **Authentication**: User registration and login
- **Life Point Tracker**: Track life points during duels with timer functionality
- **Arsenal**: Your personal deck collection displayed on a custom themed shelf
- **Deck Builder**: Create and manage YuGiOh decks with an intuitive interface
- **Game History**: Track duel statistics and results
- **Card Database**: Access comprehensive card information
- **Community**: Share decks and connect with other players

## Tech Stack

- **Frontend**: React.js
- **Backend**: MongoDB Services
- **Database**: MongoDB
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js and npm
- Firebase account with a project set up
- MongoDB database connection

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/deckdojo.git
   cd deckdojo
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure Firebase:
   - Update the Firebase configuration in your environment variables

4. Configure MongoDB:
   - Ensure your MongoDB connection string is set in your environment variables

5. Start the development server:
   ```
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select your existing project
3. Enable Authentication (Email/Password)
4. Add your app to Firebase (Web app)
5. Set up your environment variables with Firebase configuration

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run deploy`: Deploys the app to Firebase hosting

## Features In Development

- Mobile app support with responsive design
- Expanded community features
- Advanced deck statistics and analysis

## License

This project is licensed under the MIT License.
