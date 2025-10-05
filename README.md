# SupportTech Dashboard

## Overview

SupportTech Dashboard is a professional, enterprise-grade ticket management system designed for customer support teams. Built with modern web technologies, this application enables support agents to efficiently manage customer tickets, collaborate in real-time, and provide timely assistance to customers.

![SupportTech Dashboard](public/favicon.svg)

## Features

- **Real-time Ticket Management**: Monitor and update support tickets with real-time synchronization across all connected agents
- **Agent Collaboration**: Communicate with other agents through an integrated messaging system
- **Ticket Prioritization**: Organize tickets by priority (Critical, High, Medium, Low) and status (Open, In Progress, Resolved)
- **Dashboard Analytics**: Track ticket statistics and agent performance through comprehensive visual analytics
- **Responsive Design**: Optimized for both desktop and mobile experiences
- **User Authentication**: Secure login and registration system with JWT authentication
- **Ticket Assignment**: Assign tickets to specific agents and track ownership
- **SLA Monitoring**: Track time-sensitive tickets and receive alerts for approaching SLA deadlines

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with Radix UI components
- **State Management**: React Context API
- **Real-time Communication**: SignalR (@microsoft/signalr)
- **API Communication**: Axios
- **Routing**: React Router v7
- **Testing**: Vitest with React Testing Library
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://your-api-endpoint/api
VITE_SIGNALR_URL=http://your-signalr-endpoint/hub
```

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── components/        # UI components
│   ├── ui/            # Base UI components (buttons, cards, etc.)
│   └── __tests__/     # Component tests
├── context/           # React Context providers
├── enums/             # TypeScript enumerations
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── pages/             # Page components
├── services/          # API and communication services
├── test/              # Test utilities
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Deployment

The application can be deployed to any static hosting provider that supports single-page applications. The production build creates optimized assets in the `dist/` directory.

```bash
npm run build
```

## Contributing

1. Follow the established code style and organization
2. Write tests for new features
3. Ensure all tests pass before submitting changes
4. Use descriptive commit messages

## License

Proprietary - All rights reserved

---

© 2025 SupportTech. Last updated: October 5, 2025
