# MDP Project Frontend

A Next.js frontend application with TypeScript, Tailwind CSS, and Ant Design for the user authentication system.

## Features

- Login page with validation
- Role-based dashboard (Admin, Manager, User)
- Protected routes
- Password change functionality
- JWT token management
- Responsive design with Tailwind CSS
- Modern UI components with Ant Design

## Prerequisites

- Node.js 18+ or later
- npm or yarn
- The backend API running on localhost:3033

## Setup Instructions

### 1. Navigate to Frontend Directory
```bash
cd mdp-project-frontend/mdp-ss-xiii-mini-project
```

### 2. Install Dependencies

If you encounter npm issues, try one of these approaches:

**Option A: Clear npm cache and try again**
```bash
npm cache clean --force
rm package-lock.json
npm install
```

**Option B: Use yarn instead**
```bash
npm install -g yarn
yarn install
```

**Option C: Use npm with legacy peer deps**
```bash
npm install --legacy-peer-deps
```

### 3. Configure API Endpoint
The API endpoint is configured in `src/utils/api.ts`. By default it points to:
```typescript
const API_BASE_URL = 'http://localhost:3033/api';
```

### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
```

The application will start on `http://localhost:3000`

## Test Credentials

Use these credentials to test different user roles:

- **Admin**: username=`admin`, password=`password123!`
- **Manager**: username=`manager`, password=`password123!`
- **User**: username=`user`, password=`password123!`

## Authentication Flow

1. **Login Page** (`/login`): Username/password authentication
2. **Protected Routes**: Automatic redirection for unauthenticated users
3. **Role-based Dashboard**: Different content based on user role
4. **Token Management**: JWT tokens stored in localStorage
5. **Password Change**: Secure password update functionality

## User Roles and Access

### Admin Dashboard
- Total Users statistics
- Active Sessions monitoring
- System Reports access
- Configuration management
- User management tools

### Manager Dashboard  
- Team Members overview
- Active Projects tracking
- Pending Reviews management
- Project creation tools
- Team management access

### User Dashboard
- Personal documents view
- Pending tasks tracking
- Completion statistics
- Document creation tools

## Troubleshooting

### Common Issues

1. **npm install fails**: Try using yarn or the legacy peer deps flag
2. **API calls fail**: Check if backend is running on port 3033
3. **Token errors**: Clear localStorage and login again
4. **Build errors**: Ensure all TypeScript types are properly imported
