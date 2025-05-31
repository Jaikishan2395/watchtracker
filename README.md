# Watch - Learning Platform

A modern learning platform built with React, TypeScript, and Vite that provides a comprehensive environment for users to learn through video playlists and coding exercises.

## 🌟 Features

### Learning Features
- Video playlist management
- Interactive coding exercises
- Progress tracking and analytics
- Personalized learning paths
- Question bank with filtering
- Task management system

### User Experience
- Responsive design
- Dark/Light theme support
- Intuitive navigation
- Real-time progress updates
- Interactive UI components
- Accessibility support

### Technical Features
- TypeScript for type safety
- Modern React practices
- Efficient state management
- Code splitting
- Performance optimization
- Secure authentication

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod
- **UI Components**: Radix UI primitives
- **Code Editor**: Monaco Editor
- **Authentication**: Firebase
- **Theme**: next-themes

### Development Tools
- ESLint for code linting
- TypeScript for type checking
- PostCSS for CSS processing
- SWC for fast compilation

## 📁 Project Structure

```
watch/
├── src/
│   ├── api/          # API integration
│   ├── assets/       # Static assets
│   ├── components/   # Reusable components
│   ├── context/      # React contexts
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utility libraries
│   ├── pages/        # Route components
│   ├── services/     # Business logic
│   ├── types/        # TypeScript types
│   └── utils/        # Helper functions
├── public/           # Public assets
├── server/           # Backend server
└── asset/           # Additional assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/watch.git
cd watch
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 📱 Available Routes

- `/` - Splash page
- `/login` - Login page
- `/create-account` - Registration page
- `/dashboard` - Main dashboard
- `/library` - Learning library
- `/all-questions` - Question bank
- `/todo` - Task management
- `/playlist/:playlistId` - Playlist details
- `/playlist/:playlistId/play` - Video player
- `/profile` - User profile
- `/settings` - Application settings

## 🎯 Key Components

### Layout Components
- `AppSidebar` - Main navigation
- `ProgressTabs` - Progress tracking
- `StreakTracker` - Learning streak
- `ActivityHeatmap` - Activity visualization

### Learning Components
- `PlaylistCard` - Playlist display
- `VideoCard` - Video information
- `CodingQuestionCard` - Coding exercises
- `QuestionList` - Question management

### UI Components
- `StatsCard` - Statistics display
- `Timer` - Time tracking
- `PrivacySection` - Privacy settings
- Various shadcn/ui components

## 🔧 Development

### Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Code Style
- Follow TypeScript best practices
- Use functional components
- Implement proper error handling
- Write clean, documented code
- Follow accessibility guidelines

### State Management
- Use React Query for server state
- Implement React Context for global state
- Utilize local storage for persistence
- Follow proper data flow patterns

## 🛡 Security

### Authentication
- Firebase authentication
- Protected routes
- Session management
- Secure data handling

### Data Protection
- Input validation
- XSS prevention
- CSRF protection
- Secure API calls

## 📊 Performance

### Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization
- Caching strategy

### Monitoring
- Performance metrics
- Error tracking
- User analytics
- Load time optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Pull Request Process
1. Update documentation
2. Add necessary tests
3. Ensure all tests pass
4. Follow code style guidelines
5. Update the README if needed

## 📝 License

This project is private and proprietary. All rights reserved.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the build tool
- shadcn/ui for the component library
- All contributors and supporters
