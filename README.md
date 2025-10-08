# Sojourn Admin Dashboard

This is the administrative dashboard for the Sojourn Multi-Vendor Platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### ✅ Authentication & Security

- **JWT Token Authentication** with automatic decoding and validation
- **Phone number + OTP verification** for secure login
- **AuthGuard protection** for all admin routes
- **Token expiration handling** with automatic logout
- **Role-based access control** (Admin role required)

### 📊 Dashboard Overview

- **Real-time statistics** showing total users, vendors, pending applications
- **Quick action cards** for easy navigation
- **Visual indicators** with color-coded status badges

### 🏢 Vendor Management

- **Complete vendor application review** with detailed business information
- **Approve/Reject/Suspend** vendor applications with one click
- **Filtering and pagination** by status, vendor type, etc.
- **Detailed vendor profiles** including bank details and legal documents
- **Real-time status updates** with toast notifications

### 👥 User Management

- **Comprehensive user listing** with role and status filters
- **Admin role assignment** with custom permissions
- **User account activation/deactivation**
- **Role management** (Customer, Vendor, Admin)
- **Profile information display** for vendors and admins

### 👨‍💼 Admin Profile Management

- **Editable admin profile** with full name and email
- **Permission management** with granular controls
- **Security information** and account status display

### 🎨 UI/UX Features

- **Modern, responsive design** that works on desktop, tablet, and mobile
- **Toast notifications** for success/error feedback
- **Loading states** and skeleton screens
- **Modal dialogs** for detailed views and confirmations
- **Active navigation** indicators
- **Professional color scheme** with accessibility in mind

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: JWT with jsonwebtoken library
- **API Client**: Fetch API with custom AdminAPI class
- **Notifications**: Custom Toast system

## 🏗️ Project Structure

```
app/
├── layout.tsx                 # Root layout with providers
├── page.tsx                   # Landing/redirect page
├── auth/
│   └── page.tsx              # Authentication page
└── dashboard/
    ├── layout.tsx            # Dashboard layout with navigation
    ├── page.tsx              # Dashboard overview
    ├── vendors/
    │   └── page.tsx          # Vendor management
    ├── users/
    │   └── page.tsx          # User management
    └── profile/
        └── page.tsx          # Admin profile

components/
├── AuthGuard.tsx             # Route protection component
├── Toast.tsx                 # Toast notification component
└── auth/
    ├── PhoneLogin.tsx        # Phone number input
    └── OTPVerification.tsx   # OTP verification

contexts/
├── AuthContext.tsx           # Authentication state management
└── ToastContext.tsx          # Toast notifications management

lib/
└── auth.ts                   # API client and types
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Access to Sojourn backend API

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd admin.sojourn
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your backend API URL:

   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3000/api
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication Flow

1. **Login**: Enter phone number → Receive OTP → Verify OTP
2. **JWT Storage**: Access and refresh tokens stored in localStorage
3. **Auto-login**: JWT decoded on app load to restore session
4. **Route Protection**: AuthGuard redirects unauthenticated users
5. **Auto-logout**: Invalid/expired tokens trigger automatic logout

## 📋 Admin API Integration

The dashboard integrates with these backend API endpoints:

### Vendor Management

- `GET /auth/admin/vendors` - List vendors with filters
- `PUT /auth/admin/vendor/:id/approve` - Approve vendor
- `PUT /auth/admin/vendor/:id/reject` - Reject vendor
- `PUT /auth/admin/vendor/:id/suspend` - Suspend vendor

### User Management

- `GET /auth/admin/users` - List users with filters
- `PUT /auth/admin/user/:id/assign-admin` - Assign admin role
- `PUT /auth/admin/user/:id/revoke-admin` - Revoke admin role
- `PUT /auth/admin/user/:id/toggle-status` - Activate/deactivate user

### Profile Management

- `PUT /auth/admin/profile` - Update admin profile

## 🎯 Key Features Explained

### AuthGuard System

```tsx
// Protects all dashboard routes automatically
<AuthGuard>
  <DashboardContent />
</AuthGuard>
```

### Toast Notifications

```tsx
const { showSuccess, showError } = useToast();
showSuccess("Vendor approved successfully!");
```

### API Error Handling

```tsx
try {
  const response = await AdminAPI.approveVendor(vendorId);
  showSuccess("Vendor approved!");
} catch (error) {
  showError("Failed to approve vendor.");
}
```

### Real-time Updates

- Actions trigger immediate UI updates
- Optimistic updates for better UX
- Error handling with rollback capability

## 🔧 Development Guidelines

### Adding New Features

1. Create API methods in `lib/auth.ts`
2. Add TypeScript interfaces for data types
3. Implement UI components with proper error handling
4. Add toast notifications for user feedback
5. Include loading states and accessibility

### Code Style

- Use TypeScript for type safety
- Follow React hooks patterns
- Implement proper error boundaries
- Use semantic HTML elements
- Maintain responsive design principles

## 📱 Responsive Design

The dashboard is fully responsive:

- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Condensed layout with maintained functionality
- **Mobile**: Hamburger menu with essential features

## 🔒 Security Considerations

- JWT tokens validated on every API call
- Admin role required for all dashboard access
- Sensitive actions require confirmation dialogs
- Automatic logout on token expiration
- HTTPS recommended for production

## 📈 Performance Optimizations

- React.memo for expensive components
- Lazy loading for large datasets
- Pagination to limit data transfer
- Skeleton screens for better perceived performance
- Optimistic updates for immediate feedback

## 🚀 Deployment

### Environment Setup

```env
NEXT_PUBLIC_BACKEND_URL=https://api.sojourn.com/api
```

### Build Commands

```bash
npm run build
npm start
```

### Recommended Platforms

- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Custom VPS with PM2

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Ensure all checks pass

## 📄 License

This project is part of the Sojourn Multi-Vendor Platform.

---

**Built with ❤️ for efficient platform administration**
