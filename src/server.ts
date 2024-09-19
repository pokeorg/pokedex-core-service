import app from './app';
import { config } from './config/config';

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// import express from 'express';
// import passport from 'passport';
// import dotenv from 'dotenv';
// import authRoutes from './routes/authRoutes';
// import './config/passportConfig'; // Import the passport strategies

// dotenv.config(); // Load environment variables

// const app = express();

// // Middleware for parsing JSON
// app.use(express.json());

// // Initialize passport
// app.use(passport.initialize());

// // Use the auth routes with a '/auth' prefix
// app.use('/auth', authRoutes);

// // Set the port from the environment variable or default to 3000
// const PORT = process.env.PORT || 3000;

// // Start the server
// const server = app.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });

// // Graceful shutdown handler
// const shutdownServer = (signal: string) => {
//   console.log(`Received ${signal}, shutting down gracefully...`);
//   server.close(() => {
//     console.log('💡 Server closed');
//     process.exit(0);
//   });
// };

// // Handle SIGTERM and SIGINT for graceful shutdown
// process.on('SIGTERM', () => shutdownServer('SIGTERM'));
// process.on('SIGINT', () => shutdownServer('SIGINT'));

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (error) => {
//   console.error('Unhandled Rejection:', error);
//   shutdownServer('Unhandled Rejection');
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
//   shutdownServer('Uncaught Exception');
// });