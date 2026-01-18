# Vehico - Vehicle Service Tracker (Frontend)

React + Vite PWA application for tracking vehicle maintenance and service history.

## Tech Stack

- **React 19.0.0** with TypeScript
- **Vite 6.0** - Build tool
- **Chakra UI v3** - UI component library
- **React Router v7** - Routing
- **Zustand** - State management
- **TanStack Query** - Data fetching & caching
- **TanStack Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Vite PWA Plugin** - Progressive Web App support

## Features

- ✅ User authentication (login/register)
- ✅ JWT token management with auto-refresh
- ✅ Multi-vehicle management
- ✅ Service history tracking
- ✅ Vehicle sharing with permission levels (view/edit/owner)
- ✅ Dark mode support (default)
- ✅ PWA capabilities (offline support, installable)
- ✅ Responsive mobile-first design
- ✅ Type-safe API calls with TypeScript

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── layout/          # Layout components (Navbar, ProtectedRoute)
│   └── ui/              # Chakra UI wrappers (Field, Toaster, ColorMode)
├── pages/               # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── VehicleDetail.tsx
│   └── Profile.tsx
├── hooks/               # Custom hooks
│   ├── useAuth.ts
│   ├── useVehicles.ts
│   └── useServices.ts
├── services/            # API services
│   ├── api.ts          # Axios instance with interceptors
│   ├── auth.service.ts
│   ├── vehicle.service.ts
│   ├── service.service.ts
│   └── parts.service.ts
├── store/               # Zustand stores
│   └── authStore.ts
├── types/               # TypeScript types/interfaces
│   ├── auth.types.ts
│   ├── vehicle.types.ts
│   ├── service.types.ts
│   ├── parts.types.ts
│   └── common.types.ts
├── utils/               # Utility functions
│   ├── storage.ts      # localStorage wrapper
│   └── format.ts       # Date, currency formatters
├── config/
│   └── constants.ts    # API URL, routes, constants
├── App.tsx
├── main.tsx
└── theme.ts            # Chakra UI theme customization
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn or pnpm
- Backend API running on `http://localhost:3000`

### Installation

1. Navigate to dashboard-vehico folder:
```bash
cd dashboard-vehico
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` if needed:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Vehico - Vehicle Service Tracker
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Linting & Formatting

Run ESLint:
```bash
npm run lint
```

Fix ESLint errors:
```bash
npm run lint:fix
```

Format code with Prettier:
```bash
npm run format
```

## API Integration

The app connects to the backend API with the following features:

### Authentication
- **Auto-attach tokens**: Access token automatically added to all requests
- **Token refresh**: Automatically refreshes expired access tokens using refresh token
- **401 handling**: Redirects to login when refresh token fails

### Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get user profile
- `GET /vehicles` - Get all vehicles (owned + shared)
- `POST /vehicles` - Create vehicle (with photo upload)
- `GET /vehicles/:id` - Get vehicle details
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle
- `POST /vehicles/:id/share` - Share vehicle
- `GET /services/vehicle/:id` - Get service history
- `POST /services` - Create service record
- `GET /parts` - Get parts catalog

## PWA Features

The app is configured as a Progressive Web App with:

- **Service Worker**: Automatic updates
- **Offline Support**: Network-first strategy for API calls, cache-first for images
- **Installable**: Can be installed on mobile devices and desktop
- **Manifest**: Proper PWA manifest with icons
- **Cache Strategy**:
  - API calls: Network-first with 24h cache fallback
  - Images (Cloudinary): Cache-first with 30-day expiration

## Dark Mode

Dark mode is enabled by default. Users can toggle between light and dark themes using the ColorModeButton in the navbar.

## State Management

- **Auth State**: Managed by Zustand with localStorage persistence
- **API Data**: Managed by TanStack Query with automatic caching and refetching
- **Form State**: Managed by TanStack Form with Zod validation

## Form Validation

All forms use TanStack Form + Zod for type-safe validation:

```typescript
const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
```

## Permission System

The app supports three permission levels for shared vehicles:

- **Owner**: Full control (CRUD, sharing, delete)
- **Edit**: Can view and add/edit service records
- **View**: Read-only access

## Storage

Token storage using localStorage:
- `vehico_access_token` - JWT access token (15 min expiry)
- `vehico_refresh_token` - JWT refresh token (30 day expiry)
- `vehico_user` - User data (persisted by Zustand)

## Contributing

1. Follow the existing code structure
2. Use TypeScript strictly (no `any` unless necessary)
3. Format code with Prettier before committing
4. Ensure all ESLint rules pass

## License

Private project for Vehico application.
