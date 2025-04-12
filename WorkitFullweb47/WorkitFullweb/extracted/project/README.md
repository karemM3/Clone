# WorkiT - Freelance Marketplace Platform

A platform for freelancers and clients to connect, collaborate, and create.

## Getting Started

These instructions will help you get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager
- [MongoDB](https://www.mongodb.com/try/download/community) (optional, for full database functionality)

### Installation

1. Clone this repository
2. Navigate to the project directory:
   ```
   cd workit
   ```
3. Install dependencies:
   ```
   bun install
   ```

### Running the Application

#### Option 1: Running frontend only with mock data

If you just want to run the frontend with mock data:

```bash
# Start the development server
bun dev
```

The application will be available at http://localhost:5173

#### Option 2: Running with simple API server (recommended for testing)

This option uses an in-memory API server without requiring MongoDB:

```bash
# Start the simple API server in one terminal
bun server/simple-server.js

# In another terminal, start the frontend
bun dev
```

The frontend will be available at http://localhost:5173
The API will be available at http://localhost:5001/api

#### Option 3: Running with full MongoDB backend (advanced)

This requires MongoDB to be installed and running:

1. Install MongoDB locally or use MongoDB Atlas
2. Import the sample data (see MongoDB section below)
3. Run the backend server and frontend:

```bash
# Start the backend server
bun server/server.js

# In another terminal, start the frontend
bun dev
```

## MongoDB Integration

### Using MongoDB Compass

1. Install [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect to your MongoDB instance (local or Atlas)
3. Create a new database called `workit`
4. Import the sample data from `server/examples/mongodb-sample-data.json`

For detailed instructions, see the [MongoDB Compass Guide](./MONGODB_COMPASS_GUIDE.md).

## Project Structure

```
workit/
├── src/             # Frontend React application
│   ├── components/  # Reusable UI components
│   ├── context/     # React context providers
│   ├── models/      # TypeScript interfaces and models
│   ├── pages/       # React pages/routes
│   └── services/    # API services and utilities
├── server/          # Backend server
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   ├── examples/    # Sample data for MongoDB
│   └── server.js    # Main server entry point
└── public/          # Static assets
```

## Features

- User profiles for both freelancers and clients
- Service listings with categories and search
- Job postings and applications
- Messaging system
- Dashboard for managing services, jobs, and orders
- Responsive design for all devices

## Available Scripts

- `bun dev` - Start the development server
- `bun build` - Build the application for production
- `bun server` - Run the backend server
- `bun server:dev` - Run the backend server with automatic restart on changes
- `bun dev:full` - Run both frontend and backend concurrently (requires MongoDB)
- `bun lint` - Run ESLint to check and fix code style issues

## Troubleshooting

### Common Issues

- **API Connection Issues**: Make sure the server is running on port 5001. Check the API status at http://localhost:5001/api
- **MongoDB Connection Issues**: If using MongoDB, ensure it's running and accessible. Check connection status at http://localhost:5001/api/dbstatus
- **Missing Data**: If you're not seeing any services or users, the API server might not be running properly
