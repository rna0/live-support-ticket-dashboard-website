# Jiraff Dashboard

## Overview

A production-ready, enterprise-grade real-time ticket management system designed for customer support teams. This application provides a comprehensive platform for managing support tickets, enabling real-time collaboration between agents, and delivering exceptional customer service through an intuitive interface.

## Key Features

### Core Functionality
- **Real-time Ticket Management**: Live synchronization of ticket updates across all connected agents using SignalR WebSocket connections
- **Advanced Dashboard Analytics**: Comprehensive visual analytics with ticket statistics, status tracking, and performance metrics
- **Intelligent Ticket Assignment**: Smart agent assignment system with workload balancing and availability tracking
- **Priority Management**: Four-tier priority system (Critical, High, Medium, Low) with visual indicators and SLA tracking
- **Status Workflow**: Streamlined ticket lifecycle management (Open → In Progress → Resolved)

### Agent Collaboration
- **Real-time Messaging**: Built-in communication system for agent-to-agent collaboration
- **Session Management**: Persistent session tracking with automatic reconnection handling
- **Agent Presence**: Live status indicators showing agent availability and online state
- **Heartbeat Monitoring**: Automatic agent status updates with configurable intervals

### User Experience
- **Responsive Design**: Mobile-first approach with adaptive layouts for desktop, tablet, and mobile devices
- **Accessible UI**: WCAG 2.1 AA compliant interface using Radix UI primitives
- **Dark Mode Support**: System-aware theme with manual override capability
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with real-time features

### Security & Authentication
- **JWT-based Authentication**: Secure token-based authentication with automatic refresh
- **HTTP-only Cookies**: Protection against XSS attacks
- **CSRF Protection**: Built-in cross-site request forgery prevention
- **Role-based Access Control**: Configurable permissions for different agent levels

## Technology Stack

### Frontend Framework
- **React 19.1.1**: Latest React with concurrent features and automatic batching
- **TypeScript 5.8.3**: Full type safety with strict mode enabled
- **Vite 7.1.7**: Lightning-fast HMR and optimized production builds

### UI & Styling
- **TailwindCSS 4.1.13**: Utility-first CSS with JIT compilation
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide React**: 500+ consistent, customizable icons
- **Class Variance Authority**: Type-safe component variants

### State & Data Management
- **React Context API**: Global state management for authentication and communication
- **Custom Hooks**: Reusable logic for API calls, WebSocket events, and side effects
- **Axios 1.12.2**: Promise-based HTTP client with interceptors

### Real-time Communication
- **SignalR 9.0.6**: WebSocket-based real-time bidirectional communication
- **Automatic Reconnection**: Resilient connection handling with exponential backoff
- **Message Queuing**: Ensures message delivery during temporary disconnections

### Testing & Quality
- **Vitest 3.2.4**: Blazing fast unit test framework with native ESM support
- **React Testing Library 16.3.0**: User-centric component testing
- **@testing-library/jest-dom 6.9.1**: Custom DOM matchers
- **JSDOM 27.0.0**: Browser environment simulation
- **Test Coverage**: Comprehensive coverage reporting with Istanbul

### Developer Tools
- **ESLint 9.36.0**: Pluggable linting with TypeScript support
- **React Router 7.9.3**: Declarative routing with code splitting
- **@vitejs/plugin-react**: Fast Refresh and JSX optimization

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (LTS recommended)
- **npm**: v9.0.0 or higher, or **yarn**: v1.22.0 or higher
- **Git**: For version control

### Environment Configuration

Create a `.env` file in the project root:

```env
# API Configuration
VITE_API_URL=http://localhost:5238/api
VITE_SIGNALR_URL=http://localhost:5238/hub

# Optional: Feature Flags
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEBUG_LOGS=false
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd live-support-ticket-dashboard-website

# Install dependencies
npm install

# Start development server
npm run dev

# Application will be available at http://localhost:5173
```

### Build & Deployment

```bash
# Production build
npm run build

# Preview production build locally
npm run preview

# Type checking
npm run build  # Includes TypeScript compilation check

# Linting
npm run lint
```

### Testing

```bash
# Run tests in watch mode (development)
npm test

# Run tests with interactive UI
npm run test:ui

# Single test run (CI/CD)
npm run test:run

# Generate coverage report
npm run test:coverage
```

## Project Architecture

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI primitives (buttons, cards, dialogs)
│   ├── AgentSearchSelect.tsx
│   ├── Header.tsx
│   ├── Login.tsx
│   ├── Sidebar.tsx
│   ├── TicketDetails.tsx
│   ├── TicketList.tsx
│   └── __tests__/       # Component unit tests
│
├── context/             # React Context providers
│   ├── AuthContext.tsx  # Authentication state management
│   └── AuthContextTypes.tsx
│
├── enums/               # TypeScript enumerations
│   ├── Priority.ts      # Ticket priority levels
│   └── TicketStatus.ts  # Ticket status workflow
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication logic
│   ├── useCommunicationService.ts  # WebSocket management
│   ├── useCommunicationService.api.ts
│   ├── useCommunicationService.events.ts
│   └── __tests__/       # Hook unit tests
│
├── lib/                 # Utility libraries
│   └── utils.ts         # Common utilities (cn, etc.)
│
├── pages/               # Page-level components
│   ├── CreateTicket.tsx
│   ├── Dashboard.tsx
│   └── __tests__/       # Page integration tests
│
├── services/            # External service integrations
│   ├── api.ts           # REST API client
│   ├── api.interceptors.ts  # Request/response interceptors
│   ├── api.token-manager.ts # JWT token management
│   ├── communication.ts  # Unified communication service
│   └── signalr.ts       # SignalR client wrapper
│
├── test/                # Testing configuration
│   ├── setup.ts         # Test environment setup
│   ├── test-utils.tsx   # Custom render functions
│   └── TestProviders.tsx # Test context providers
│
├── types/               # TypeScript type definitions
│   ├── auth.ts          # Authentication types
│   ├── health.ts        # Health check types
│   ├── session.ts       # Session & message types
│   ├── ticket.ts        # Ticket entity types
│   └── timer.d.ts       # Global type augmentations
│
├── utils/               # Utility functions
│   ├── connection.ts    # Connection state utilities
│   ├── date.ts          # Date formatting
│   ├── ticket.ts        # Ticket-specific utilities
│   ├── validation.ts    # Form validation
│   └── __tests__/       # Utility unit tests
│
├── App.tsx              # Root application component
├── main.tsx             # Application entry point
└── index.css            # Global styles & Tailwind imports
```

## API Integration

This application requires a backend API with the following endpoints:

### Authentication
- `POST /api/auth/register` - Agent registration
- `POST /api/auth/login` - Agent login
- `POST /api/auth/logout` - Agent logout

### Tickets
- `GET /api/tickets` - List tickets with pagination and filters
- `GET /api/tickets/:id` - Get single ticket details
- `POST /api/agent/:agentId/tickets` - Create new ticket
- `PUT /api/tickets/:id/status` - Update ticket status
- `PUT /api/agent/:agentId/assign/:ticketId` - Assign ticket to agent
- `DELETE /api/tickets/:id` - Delete ticket

### Agents
- `GET /api/agents` - List agents with pagination
- `GET /api/agents/:id/status` - Get agent status
- `PUT /api/agents/:id/heartbeat` - Update agent heartbeat

### Sessions & Messages
- `POST /api/sessions` - Create chat session
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/:id/messages` - Send message
- `GET /api/sessions/:id/messages` - Get messages

### SignalR Hub
- `/hub` - WebSocket endpoint for real-time events

## Docker Support

```dockerfile
# Dockerfile included in project root
docker build -t support-ticket-dashboard .
docker run -p 8080:80 support-ticket-dashboard
```

## Performance Optimizations

- **Code Splitting**: Automatic route-based splitting with React.lazy
- **Tree Shaking**: Dead code elimination in production builds
- **Asset Optimization**: Image compression and lazy loading
- **Bundle Analysis**: Built-in visualization with `vite-plugin-visualizer`
- **Caching Strategy**: Aggressive caching for static assets

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Contributing

### Code Style
- Follow TypeScript best practices and strict mode
- Use functional components with hooks
- Implement proper error boundaries
- Write comprehensive unit and integration tests
- Document complex logic with JSDoc comments

### Commit Guidelines
- Use conventional commit format: `type(scope): message`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep commits atomic and focused

### Pull Request Process
1. Create feature branch from `main`
2. Write tests for new functionality
3. Ensure all tests pass (`npm run test:run`)
4. Verify no linting errors (`npm run lint`)
5. Update documentation as needed
6. Submit PR with clear description

## Troubleshooting

### Common Issues

**SignalR Connection Fails**
- Verify `VITE_SIGNALR_URL` is correct
- Check CORS configuration on backend
- Ensure WebSocket support in hosting environment

**Authentication Errors**
- Clear browser localStorage and cookies
- Verify JWT token format and expiration
- Check API endpoint URLs

**Build Failures**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Verify Node.js version compatibility

## License

**Proprietary** - All rights reserved

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited without express written permission from the copyright holder.

## Support & Contact

For technical support, bug reports, or feature requests, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: October 8, 2025  
**Maintained by**: Development Team
