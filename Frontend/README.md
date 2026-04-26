# Repairum Frontend

A modern React frontend for the Repairum service booking platform with real-time notifications and responsive design.

## 🚀 Vercel Deployment

This frontend is configured for deployment on Vercel with automatic builds and deployments.

### Prerequisites
- Vercel account
- Backend API deployed and accessible
- All environment variables configured

### Deployment Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd Frontend
   vercel
   ```

4. **Configure Environment Variables**
   Set the following environment variables in Vercel dashboard:
   - `VITE_API_URL` - Your deployed backend API URL (e.g., `https://your-backend.vercel.app`)
   - `VITE_NODE_ENV` - Set to `production`
   - `VITE_RAZORPAY_KEY_ID` - Your Razorpay key ID
   - `VITE_SOCKET_URL` - Your Socket.IO server URL (if using separate WebSocket service)

### Environment Variables

Create a `.env.local` file for development:
```bash
# Copy the example file
cp .env.example .env.local

# Edit with your local values
VITE_API_URL=http://localhost:5000
VITE_NODE_ENV=development
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
VITE_SOCKET_URL=http://localhost:5000
```

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Features

- **Modern React 19** with hooks and components
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.IO Client** for real-time features
- **Axios** for API communication
- **React Router** for navigation
- **Lucide React** for icons
- **Razorpay** integration for payments

### Important Notes

- The frontend automatically adapts to development or production environment
- API endpoints are configured through environment variables
- Socket.IO connection requires a separate WebSocket service for Vercel deployment
- All API requests include credentials for cookie-based authentication
