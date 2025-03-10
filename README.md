# Project Setup Instructions

## Prerequisites
- Node.js v18 or higher
- PostgreSQL database

## Installation Steps

1. Unzip the project files
2. Open a terminal in the project directory
3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file based on `.env.example` with your database credentials:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/dbname
   SESSION_SECRET=your_session_secret_key_here
   ```

5. Run database migrations:
   ```
   npm run migrate
   ```

6. Start the development server:
   ```
   npm run dev
   ```

7. Open your browser to http://localhost:5000

## Building for Production

1. Build the application:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```
# new-school-app
