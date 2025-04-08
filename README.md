# DeckDojo.app - YuGiOh Game Tracker & Deck Builder

DeckDojo is a web application for YuGiOh players to track their games (Life point/Timer), manage their decks, and access card information. The app includes features like a deck builder, game statistics, and card scanning capabilities.

## Features

- **Authentication**: User registration and login
- **Life Point Tracker**: Track life points during duels
- **Deck Builder**: Create and manage YuGiOh decks
- **Game History**: Track duel statistics
- **Card Scanner** (Coming Soon): Scan cards to check prices using ML

## Tech Stack

- **Frontend**: React.js
- **Backend**: Firebase (initial), FastAPI Python with PyTorch (future)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js and npm
- Firebase account with a project set up

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
   - Update the Firebase configuration in `src/firebase/config.js` with your Firebase project details

4. Start the development server:
   ```
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select your existing project
3. Enable Authentication (Email/Password)
4. Create a Firestore database
5. Add your app to Firebase (Web app)
6. Copy the Firebase configuration to your project:
   - Rename `src/firebase/config.template.js` to `src/firebase/config.js`
   - Replace the placeholder values with your actual Firebase configuration

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects the app from Create React App

## Future Development

- Integration with FastAPI backend for ML-based card scanning
- Mobile app development using React Native
- Advanced deck statistics and analysis

## License

This project is licensed under the MIT License.
