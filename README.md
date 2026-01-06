# PPP Poker - Planning Poker Application

A modern, web-based Planning Poker application built with React, TypeScript, and Vite. Planning Poker is a consensus-based agile estimation technique used by development teams to estimate effort or relative size of development goals.

![Home Page](https://github.com/user-attachments/assets/d28ff6df-bd6a-4695-9766-3085d365de46)

## Features

- ✨ **Room Management**: Create and join estimation rooms with unique IDs
- 🎴 **Fibonacci Cards**: Vote using standard Fibonacci sequence (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89) plus special cards (?, ☕)
- 👥 **Multiple Participants**: Support for multiple team members and observers
- 📊 **Real-time Results**: View voting results with average, most common vote, and distribution charts
- 🔄 **Multiple Rounds**: Reset and start new estimation rounds
- 📝 **Story Tracking**: Add story or task descriptions for each estimation
- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- 🌓 **Dark Theme**: Eye-friendly dark mode interface

## Screenshots

### Home Page
![Home Page](https://github.com/user-attachments/assets/d28ff6df-bd6a-4695-9766-3085d365de46)

### Create Room
![Create Room](https://github.com/user-attachments/assets/57fc0034-dd00-4f41-88d7-1a4201489ea7)

### Voting Interface
![Voting](https://github.com/user-attachments/assets/f2b28e56-8d68-4acf-a784-ac1363550780)

### Voting with Selected Card
![Card Selected](https://github.com/user-attachments/assets/7d6e0dfd-cccc-4be0-82b3-75a4181cb50e)

### Results
![Results](https://github.com/user-attachments/assets/ee98976d-d8eb-493e-bb32-835c48e42c8c)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hilderney/ppp-poker.git
cd ppp-poker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## How to Use

### Creating a Room

1. Click on "Create Room" from the home page
2. Enter a room name (e.g., "Sprint Planning")
3. Enter your name
4. Click "Create Room"

### Joining a Room

1. Click on "Join Room" from the home page
2. Enter the Room ID shared by the room creator
3. Enter your name
4. Optionally check "Join as Observer" if you don't want to vote
5. Click "Join Room"

### Voting Process

1. Enter a story or task description (optional)
2. Select a card value from the Fibonacci sequence
3. Wait for all participants to vote
4. Click "Reveal Votes" to see the results
5. Review the average, most common vote, and distribution
6. Click "Start New Round" to begin a new estimation

### Card Values

- **0-89**: Fibonacci sequence numbers for story point estimation
- **?**: Unknown or uncertain
- **☕**: Break needed or too complex to estimate

### Observer Mode

Observers can:
- View all participants
- See voting progress
- View revealed results

Observers cannot:
- Vote on stories
- Influence the estimation

## Technology Stack

- **React 19.2**: Modern React with latest features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **CSS3**: Custom styling with animations
- **Context API**: State management

## Project Structure

```
src/
├── components/          # React components
│   ├── Home.tsx        # Landing page
│   ├── PokerRoom.tsx   # Main poker room interface
│   ├── PokerCard.tsx   # Individual voting card
│   └── Results.tsx     # Results display
├── contexts/           # React contexts
│   └── PokerContext.tsx # Global state management
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── voteUtils.ts    # Vote calculation utilities
├── App.tsx             # Main app component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

Potential features for future versions:
- Real-time synchronization with WebSockets
- Persistent room storage
- Room history and analytics
- Custom card decks
- Team management
- Export results to CSV/PDF
- Integration with Jira/GitHub issues

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- Inspired by traditional Planning Poker estimation technique
- Built with modern web technologies
- Designed for remote and distributed teams
