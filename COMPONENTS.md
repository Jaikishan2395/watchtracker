# Components Documentation

## Overview
This document provides detailed information about the UI components used in the Watch learning platform.

## Core Components

### Layout Components

#### AppSidebar (`AppSidebar.tsx`)
- Main navigation sidebar component
- Handles navigation between different sections
- Includes user profile and settings access
- Responsive design with collapsible functionality

### Learning Components

#### PlaylistCard (`PlaylistCard.tsx`)
- Displays playlist information in a card format
- Shows playlist title, description, and progress
- Handles playlist navigation and management
- Supports both video and coding playlists

#### VideoCard (`VideoCard.tsx`)
- Displays individual video information
- Shows video thumbnail, title, and duration
- Handles video playback initiation
- Tracks video progress

#### CodingQuestionCard (`CodingQuestionCard.tsx`)
- Displays coding exercise information
- Shows difficulty level and completion status
- Handles exercise navigation
- Supports code submission and testing

### Progress Tracking

#### ProgressTabs (`ProgressTabs.tsx`)
- Manages different progress views
- Tracks completion status
- Shows learning statistics
- Supports filtering and sorting

#### CodingProgressDashboard (`CodingProgressDashboard.tsx`)
- Displays coding exercise progress
- Shows completion statistics
- Tracks skill development
- Provides performance metrics

#### StreakTracker (`StreakTracker.tsx`)
- Tracks user's learning streak
- Shows daily activity status
- Motivates consistent learning
- Displays streak statistics

#### ActivityHeatmap (`ActivityHeatmap.tsx`)
- Visual representation of learning activity
- Shows daily activity intensity
- Tracks long-term progress
- Supports different time ranges

### Modals and Forms

#### AddPlaylistModal (`AddPlaylistModal.tsx`)
- Form for creating new playlists
- Supports video and coding playlist types
- Handles playlist metadata input
- Validates input data

#### AddVideoModal (`AddVideoModal.tsx`)
- Form for adding videos to playlists
- Handles video URL and metadata
- Validates video information
- Supports video preview

#### AddCodingPlaylistModal (`AddCodingPlaylistModal.tsx`)
- Form for creating coding exercise playlists
- Manages coding exercise organization
- Handles difficulty levels
- Supports exercise categorization

#### AddCodingQuestionModal (`AddCodingQuestionModal.tsx`)
- Form for adding coding exercises
- Handles exercise description and test cases
- Supports code template input
- Manages difficulty settings

### Question Management

#### QuestionList (`QuestionList.tsx`)
- Displays list of questions
- Supports filtering and sorting
- Handles question selection
- Shows question status

#### QuestionInput (`QuestionInput.tsx`)
- Input component for questions
- Supports rich text input
- Handles question formatting
- Validates input data

### UI Components

#### StatsCard (`StatsCard.tsx`)
- Displays statistical information
- Shows key metrics
- Supports different data types
- Responsive design

#### Timer (`Timer.tsx`)
- Countdown timer component
- Supports different time formats
- Handles timer events
- Visual time display

#### PrivacySection (`PrivacySection.tsx`)
- Privacy settings management
- User data controls
- Privacy policy information
- Settings persistence

## UI Component Library (`ui/` directory)
The project uses shadcn/ui components, which are built on top of Radix UI primitives. These components provide a consistent, accessible, and customizable UI system.

### Key Features
- Fully accessible components
- Dark/light theme support
- Customizable styling
- Responsive design
- TypeScript support

### Available Components
- Buttons
- Forms
- Modals
- Navigation
- Cards
- Tables
- Tooltips
- Toast notifications
- And more...

## Usage Guidelines

### Component Integration
1. Import components from their respective files
2. Use TypeScript for type safety
3. Follow the component props interface
4. Implement error handling
5. Add appropriate loading states

### Styling
- Use Tailwind CSS classes
- Follow the design system
- Maintain consistency
- Support dark/light themes

### Best Practices
1. Keep components focused and single-responsibility
2. Implement proper error boundaries
3. Use React hooks effectively
4. Maintain accessibility standards
5. Write clean, documented code

## Contributing
When adding new components:
1. Follow the existing component structure
2. Add TypeScript types
3. Include proper documentation
4. Add necessary tests
5. Update this documentation 