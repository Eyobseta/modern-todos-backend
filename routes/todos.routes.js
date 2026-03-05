import express from 'express';
import {
    getTodos,
    createTodos,
    updateTodos,
    deleteTodos,
    getStreak
} from '../controllers/todos.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All todo routes are protected
router.get('/', authenticate, getTodos);
router.post('/', authenticate, createTodos);
router.put('/:id', authenticate, updateTodos);
router.delete('/:id', authenticate, deleteTodos);
router.get('/streak/:day', authenticate, getStreak);

export default router;