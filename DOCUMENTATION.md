# Watch - Learning Platform Documentation

## Project Overview
Watch is a modern learning platform built with React, TypeScript, and Vite. It provides a comprehensive environment for users to learn through video playlists and coding exercises.

## Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with shadcn/ui
- **Code Editor**: Monaco Editor
- **Authentication**: Firebase
- **Theme**: Dark/Light mode support with next-themes

## Project Structure

### Root Directory
- `src/` - Main source code directory
- `public/` - Static assets
- `server/` - Backend server code
- `asset/` - Additional assets
- Configuration files:
  - `vite.config.ts` - Vite configuration
  - `tsconfig.json` - TypeScript configuration
  - `tailwind.config.ts` - Tailwind CSS configuration
  - `postcss.config.js` - PostCSS configuration
  - `eslint.config.js` - ESLint configuration

### Source Code Structure (`src/`)

#### Core Files
- `App.tsx` - Main application component
  - Handles routing and layout structure
  - Implements theme provider and global providers
  - Manages playlist type routing logic

#### Directories
- `api/` - API integration and services
- `assets/` - Application assets
- `components/` - Reusable UI components
- `context/` - React context providers
- `hooks/` - Custom React hooks
- `lib/` - Utility libraries and configurations
- `pages/` - Route components
- `services/` - Business logic and services
- `types/` - TypeScript type definitions
- `utils/` - Helper functions and utilities

## Key Features

### Authentication
- User login and registration
- Account management
- Profile customization

### Learning Features
- Video playlist management
- Coding exercises
- Progress tracking
- Library organization

### UI/UX Features
- Responsive design
- Dark/Light theme support
- Sidebar navigation
- Toast notifications
- Tooltips and modals

## Available Routes
- `/` - Splash page
- `/login` - Login page
- `/create-account` - Registration page
- `/dashboard` - Main dashboard
- `/library` - User's learning library
- `/all-questions` - Question bank
- `/todo` - Task management
- `/playlist/:playlistId` - Playlist details
- `/playlist/:playlistId/play` - Video player
- `/profile` - User profile
- `/settings` - Application settings

## Development

### Prerequisites
- Node.js
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Dependencies
The project uses several key dependencies:
- React and React DOM for UI
- React Router for navigation
- React Query for data fetching
- Tailwind CSS for styling
- Radix UI for accessible components
- Firebase for authentication
- Monaco Editor for code editing
- Various UI utilities from shadcn/ui

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is private and proprietary. 