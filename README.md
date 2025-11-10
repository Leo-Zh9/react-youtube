# Reactflix

A full-stack video sharing platform combining YouTube functionality with a Netflix-style UI.

## Features

- User authentication and authorization
- Video upload and streaming
- Video search and discovery
- Playlists management
- Comments and likes
- User subscriptions
- Password reset functionality
- Responsive Netflix-inspired interface

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- Swiper

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- AWS S3 for video storage
- FFmpeg for video processing
- Multer for file uploads

## Installation

Install dependencies for both client and server:

```bash
npm run install:all
```

Or install separately:

```bash
npm run install:client
npm run install:server
```

## Configuration

Create `.env` files in both `client` and `server` directories with the required environment variables:

### Server (.env)
- MongoDB connection string
- JWT secret
- AWS credentials (S3 bucket, access key, secret key)
- Email service credentials

### Client (.env)
- API base URL

## Running the Application

Start both client and server concurrently:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:client  # Frontend only
npm run dev:server  # Backend only
```

## Project Structure

```
reactflix/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Utility functions
│   └── ...
├── server/              # Express backend
│   ├── src/
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Custom middleware
│   │   ├── services/    # Business logic
│   │   └── config/      # Configuration files
│   └── ...
└── package.json         # Root package file
```

## License

ISC

