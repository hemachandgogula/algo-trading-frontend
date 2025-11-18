# Market Data Platform - Frontend

A modern React + TypeScript frontend application for a market data trading platform. Built with Vite, Material-UI, React Router, TanStack Query, and Zustand for state management.

## Features

- ⚡ **Fast Development**: Powered by Vite with Hot Module Replacement (HMR)
- 🔒 **Authentication**: JWT-based login/register with protected routes
- 🎨 **Material-UI**: Professional component library with responsive design
- 🔄 **State Management**: Zustand for global auth state
- 📊 **Data Fetching**: TanStack Query (React Query) for server state management
- 🛣️ **Routing**: React Router v6 with nested routes
- 📱 **Responsive**: Mobile-first responsive design
- 🧪 **Testing**: Vitest with React Testing Library
- 🧹 **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- 🌐 **WebSocket Ready**: Socket.io-client integrated for real-time updates

## Tech Stack

### Core
- React 18
- TypeScript 5.9
- Vite 7

### UI & Styling
- Material-UI (MUI) 5
- Emotion (CSS-in-JS)
- Material-UI Icons

### State & Data Management
- Zustand (global state)
- TanStack Query (server state)
- Axios (HTTP client)

### Routing & Navigation
- React Router v6

### Development Tools
- ESLint 9
- Prettier 3
- Husky (Git hooks)
- Vitest (testing framework)
- React Testing Library

### Real-time
- Socket.io-client

## Project Structure

```
src/
├── app/
│   ├── App.tsx              # Main app component with providers
│   └── Router.tsx           # Route definitions
├── pages/
│   ├── LoginPage.tsx        # Login page
│   ├── RegisterPage.tsx     # Registration page
│   ├── DashboardPage.tsx    # Main dashboard
│   └── SettingsPage.tsx     # User settings
├── components/
│   ├── Layout.tsx           # Main layout with sidebar/topbar
│   └── ProtectedRoute.tsx   # Route guard component
├── api/
│   ├── axios.ts             # Axios instance with interceptors
│   └── auth.ts              # Auth API endpoints
├── store/
│   └── authStore.ts         # Zustand auth store
├── hooks/
│   └── useAuth.ts           # Custom auth hook
├── config/
│   ├── env.ts               # Environment variables
│   ├── theme.ts             # MUI theme configuration
│   └── globalStyles.ts      # Global CSS styles
├── utils/
│   └── (utility functions)
├── __tests__/
│   ├── setup.ts             # Test setup
│   ├── Router.test.tsx      # Router tests
│   └── ProtectedRoute.test.tsx # Route protection tests
└── main.tsx                 # React DOM entry point
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your backend API URL:
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build for production:
```bash
npm run build
```

Preview production build locally:
```bash
npm run preview
```

## Available Scripts

### Development
- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint to check code quality
- `npm run format` - Format code with Prettier

### Testing
- `npm run test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI dashboard

### Git Hooks
- `npm run prepare` - Setup Husky pre-commit hooks

## Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3001/api

# WebSocket URL for real-time updates
VITE_WS_URL=ws://localhost:3001
```

See `.env.example` for more details.

## Authentication Flow

1. **Login/Register**: Users can sign up or log in via the auth pages
2. **Token Storage**: JWT tokens are stored in localStorage
3. **Request Interceptors**: Axios automatically adds the token to all requests
4. **Protected Routes**: Routes are guarded by `ProtectedRoute` component
5. **Token Refresh**: Implement refresh token logic in the `axios.ts` interceptor
6. **Logout**: Clearing tokens and redirecting to login page

## API Integration

The application includes an Axios client with built-in JWT handling:

```typescript
// Automatic token injection
// Request interceptor adds Authorization header

// Error handling
// 401 responses clear tokens and redirect to login

// Usage example:
import { authAPI } from '@api/auth';

const response = await authAPI.login({ email, password });
```

## State Management

### Authentication Store (Zustand)

```typescript
import { useAuthStore } from '@store/authStore';

const { user, token, isAuthenticated, login, logout } = useAuthStore();
```

### Server State (TanStack Query)

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['markets'],
  queryFn: () => marketAPI.getMarkets(),
});
```

## Component Library (Material-UI)

The application uses Material-UI for components. Customize the theme in `src/config/theme.ts`:

```typescript
export const theme = createTheme({
  palette: { /* ... */ },
  typography: { /* ... */ },
  components: { /* ... */ },
});
```

## Testing

Tests are located in `src/__tests__/` using Vitest and React Testing Library:

```bash
npm run test              # Run all tests
npm run test:ui          # Run tests with UI
npm run test -- --watch  # Watch mode
```

Example test:
```typescript
describe('ProtectedRoute', () => {
  it('redirects to login when not authenticated', () => {
    render(<ProtectedRoute><div>Content</div></ProtectedRoute>);
    expect(screen.queryByText(/content/i)).not.toBeInTheDocument();
  });
});
```

## Mocking During Development

While backend endpoints are being developed, you can mock API responses:

```typescript
// src/api/auth.ts
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // Mock implementation
    return {
      token: 'mock-token-123',
      refreshToken: 'mock-refresh-token',
      user: { id: '1', email: data.email, name: 'Test User' }
    };
  },
};
```

Or use MSW (Mock Service Worker) for more advanced mocking.

## Code Style

The project uses ESLint and Prettier for code consistency. Pre-commit hooks via Husky ensure code quality:

```bash
npm run lint      # Check for linting errors
npm run format    # Auto-format code
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

### Vercel
```bash
vercel deploy
```

### Netlify
```bash
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]
```

## Performance Optimization

- Code splitting with React.lazy
- Image optimization
- Caching strategies with TanStack Query
- Web fonts optimization
- Bundle analysis with Vite

## Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 3000
```

### Clear Dependencies Cache
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear Vite Cache
```bash
rm -rf .vite
npm run dev
```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review the backend API documentation

## Related Projects

- [Backend API Repository](https://github.com/example/backend)
- [Documentation](https://docs.example.com)
