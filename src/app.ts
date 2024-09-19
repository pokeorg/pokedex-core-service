import express from 'express';
import session from 'express-session';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import passport from 'passport';
import { config } from './config/config';
import './config/passportConfig'; // Import passport configuration

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST'],
  allowedHeaders: 'Content-Type, Authorization',
}));

app.use('/auth', authRoutes);

export default app;


































// import express from 'express';
// import session from 'express-session';
// import cors from 'cors';
// import authRoutes from './routes/authRoutes';
// import { config } from './config/config';
// import passport from 'passport';
// //Intitialize Express App
// const app = express();

// // Middleware to parse JSON bodies

// app.use(express.json());
// app.use(express.urlencoded({extended: true}));

// //Session middleware configuration
// app.use(session({
//   secret: config.sessionSecret || 'defaultSecret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {secure: false}
// }));


// app.use(passport.initialize());
// app.use(passport.session())


// // Configure CORS to allow requests from both frontend ports
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:5174'], // Add both frontend URLs here
//   methods: ['GET', 'POST'],
//   allowedHeaders: 'Content-Type, Authorization',
// }));

// // Middleware for JSON requests
// app.use(express.json());

// // Use the auth routes
// app.use('/auth', authRoutes);

// export default app;