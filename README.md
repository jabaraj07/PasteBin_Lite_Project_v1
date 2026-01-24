# PasteBin-Lite

A lightweight pastebin-like application that allows users to create text pastes and share them via unique URLs. Pastes can optionally expire based on time-to-live (TTL) or view count limits.

## Project Description

PasteBin-Lite is a full-stack web application built with Node.js/Express for the backend and React for the frontend. Users can create text pastes, receive shareable URLs, and view pastes through both API endpoints and HTML pages. The application supports optional constraints on pastes including time-based expiry and view-count limits.

## How to Run Locally

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Back-End
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `Back-End` directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
BASE_URL=http://localhost:3000
```

**Note:** `BASE_URL` should be your **frontend URL** (where users will access the app), not the backend URL. For local development, this is `http://localhost:3000`. For production (Vercel), this should be your Vercel domain (e.g., `https://your-app.vercel.app`).

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000` (or the port specified in your `.env` file).

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Front-End/pastebin
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and will automatically open in your browser.

## Persistence Layer

This application uses **MongoDB** as its persistence layer, accessed through **Mongoose** (MongoDB ODM for Node.js). MongoDB was chosen for the following reasons:

1. **Serverless Compatibility**: MongoDB works well with serverless platforms like Vercel when using MongoDB Atlas (cloud-hosted MongoDB)
2. **Document-based Storage**: The paste data structure fits naturally into MongoDB documents
3. **TTL Index Support**: MongoDB supports TTL indexes which can automatically expire documents, though we implement custom expiry logic for deterministic testing
4. **Scalability**: MongoDB Atlas provides a managed solution that scales with the application

The database connection is established at application startup and the health check endpoint (`/api/healthz`) verifies the connection status.

## Important Design Decisions

### 1. Deterministic Time for Testing
The application supports deterministic expiry testing through the `TEST_MODE` environment variable. When `TEST_MODE=1` is set, the application uses the `x-test-now-ms` request header to determine the current time for expiry calculations. This allows automated tests to control time and verify TTL behavior accurately.

### 2. Atomic View Count Updates
View count increments are performed atomically using MongoDB's `findOneAndUpdate` with conditions. This prevents race conditions where concurrent requests might exceed the view limit. The update only succeeds if the current view count is less than the maximum allowed views.

### 3. XSS Protection
All paste content rendered in HTML is escaped using a custom `escapeHtml` function to prevent cross-site scripting (XSS) attacks. This ensures that user-provided content cannot execute scripts when viewed.

### 4. Error Handling
- Invalid inputs return HTTP 4xx status codes with JSON error messages
- Unavailable pastes (missing, expired, or view limit exceeded) consistently return HTTP 404
- All API responses return valid JSON with appropriate Content-Type headers

### 5. Response Format Consistency
- Create paste endpoint returns only `{id, url}` as specified in requirements
- Fetch paste endpoint returns `{content, remaining_views, expires_at}` with proper null handling
- Health check returns `{ok: true/false}` reflecting database connection status

### 6. Field Naming
The API uses snake_case for request/response fields (`ttl_seconds`, `max_views`, `remaining_views`, `expires_at`) to match the specification, while internal database fields use a mix of camelCase and snake_case for consistency with Mongoose conventions.

## API Endpoints

- `GET /api/healthz` - Health check endpoint
- `POST /api/pastes` - Create a new paste
- `GET /api/pastes/:id` - Fetch a paste (API, increments view count)
- `GET /p/:id` - View a paste (HTML page, increments view count)

## Testing

The application is designed to pass automated tests that verify:
- Service health and JSON responses
- Paste creation and retrieval
- View limit enforcement
- TTL expiry behavior
- Combined constraint handling
- Error handling for invalid inputs
- Robustness under concurrent load

## Deployment

For deployment on Vercel or similar serverless platforms:
1. **Frontend (Vercel)**: Deploy the frontend to Vercel. Note your Vercel domain (e.g., `https://your-app.vercel.app`)
2. **Backend**: Deploy backend separately (Vercel serverless functions, Railway, Render, etc.)
3. **Environment Variables**:
   - Backend: Set `BASE_URL` to your **frontend Vercel URL** (e.g., `https://your-app.vercel.app`)
   - Backend: Set `MONGODB_URI` to your MongoDB Atlas connection string
   - Backend: Set `TEST_MODE=1` if needed for automated testing
   - Frontend: Set `REACT_APP_BACKEND_URL` to your backend API URL
4. The application will automatically connect to MongoDB on startup

