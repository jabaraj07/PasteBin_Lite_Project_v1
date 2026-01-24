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
FRONTEND_URL=http://localhost:3000
```

**Note:** 
- `FRONTEND_URL` should be your **frontend URL** (where users will access the app), not the backend URL. For local development, this is `http://localhost:3000`. For production (Vercel), this should be your Vercel domain (e.g., `https://your-app.vercel.app`).
- `FRONTEND_URL` is used for CORS configuration and generating paste URLs. The backend also supports `BASE_URL` as a fallback for backward compatibility, but `FRONTEND_URL` is preferred.

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

3. Create a `.env` file (optional, for local development):
```
REACT_APP_BACKEND_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and will automatically open in your browser.

**Note:** The frontend automatically trims leading and trailing whitespace from paste content before submission. Whitespace-only content will be rejected with a validation error.

## Persistence Layer

This application uses **MongoDB** as its persistence layer, accessed through **Mongoose** (MongoDB ODM for Node.js). MongoDB was chosen for the following reasons:

1. **Serverless Compatibility**: MongoDB works well with serverless platforms like Vercel when using MongoDB Atlas (cloud-hosted MongoDB)
2. **Document-based Storage**: The paste data structure fits naturally into MongoDB documents
3. **Scalability**: MongoDB Atlas provides a managed solution that scales with the application

The database connection is established at application startup and the health check endpoint (`/api/healthz`) verifies the connection status.

### Expiration Handling

**Important**: Expiration is handled manually, not via MongoDB TTL indexes. Here's why:

- `expiresAt` is stored as a **Number** (milliseconds timestamp) rather than a Date object
- MongoDB TTL indexes only work with Date objects, not Number timestamps
- This design choice allows deterministic testing via the `TEST_MODE` environment variable
- Expired pastes are **not automatically deleted** from the database
- When accessing an expired paste, the application checks `expiresAt < currentTime` and returns 404
- Expired pastes remain in the database but are treated as "not found" for all practical purposes
- Manual cleanup of expired pastes can be implemented via a scheduled job if needed, but is not currently included

## Important Design Decisions

### 1. Deterministic Time for Testing and Manual Expiration
The application supports deterministic expiry testing through the `TEST_MODE` environment variable. When `TEST_MODE=1` is set, the application uses the `x-test-now-ms` request header to determine the current time for expiry calculations. This allows automated tests to control time and verify TTL behavior accurately.

**Expiration Implementation**: Expiration is checked manually in the controller code by comparing `expiresAt` (stored as Number timestamp) with the current time. Expired pastes are not automatically deleted from the database - they remain stored but return 404 when accessed. This approach:
- Enables deterministic testing (can control "current time" via headers)
- Avoids reliance on MongoDB TTL indexes (which require Date objects)
- Keeps expired data available for potential audit/debugging purposes
- Allows for optional cleanup jobs to be added later if needed

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

### 7. CORS Configuration
The backend uses CORS (Cross-Origin Resource Sharing) to restrict API access to only the configured frontend URL. This is controlled by the `FRONTEND_URL` environment variable. In production, this prevents unauthorized domains from accessing your API.

### 8. Input Validation and Sanitization
- Frontend automatically trims leading and trailing whitespace from paste content
- Whitespace-only content is rejected with a clear error message
- Content length is validated (max 1MB = 1,048,576 characters)
- TTL and max_views are validated to be positive integers when provided

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

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deployment Summary

1. **Frontend (Vercel)**: 
   - Deploy the frontend to Vercel. Note your Vercel domain (e.g., `https://your-app.vercel.app`)
   - Set Root Directory to `Front-End/pastebin` (if using monorepo)
   - **Required Environment Variable**: `REACT_APP_BACKEND_URL` = your backend URL (no trailing slash)

2. **Backend (Render or similar)**:
   - Deploy backend separately (Render, Railway, etc.)
   - **Required Environment Variables**:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `FRONTEND_URL`: Your frontend Vercel URL (e.g., `https://your-app.vercel.app`) - **no trailing slash**
     - `NODE_ENV`: `production`
     - `PORT`: Usually auto-set by platform
   - **Optional**: `TEST_MODE=1` for automated testing
   - **Optional**: `BASE_URL` (supported as fallback, but `FRONTEND_URL` is preferred)

3. **CORS Configuration**: 
   - The backend automatically configures CORS based on `FRONTEND_URL`
   - This ensures only your frontend domain can access the API

4. The application will automatically connect to MongoDB on startup

