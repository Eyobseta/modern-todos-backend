import express from 'express';
import cors from 'cors';
import todosRouter from "./routes/todos.routes.js";
import authRouter from "./routes/auth.routes.js";
import { config } from 'dotenv';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

config();

const port = process.env.PORT || 3000; // or 3001 if you prefer

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

app.use('/api/todos', todosRouter);
app.use('/api/auth', authRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});