import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';

const app = express();

// Configure CORS to allow requests from both frontend ports
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Add both frontend URLs here
  methods: ['GET', 'POST'],
  allowedHeaders: 'Content-Type, Authorization',
}));

app.use(express.json());
app.use('/auth', authRoutes);

export default app;