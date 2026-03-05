import {
    fetchTodos,
    fetchTodoByDay,
    createTodo,
    updateTodoStatus,
    updateTodo,
    deleteTodo,
    fetchCompletedCountByDay
} from "../repositories/todos.repositories.js";

const createNotFoundError = (id) => {
    const error = new Error(`Todo with id ${id} not found`);
    error.status = 404;
    return error;
};

async function getTodos(req, res, next) {
    try {
        const userId = req.user.userId;
        const { day } = req.query;
        if (day) {
            const todos = await fetchTodoByDay(userId, day);
            return res.status(200).json(todos);
        }
        const todos = await fetchTodos(userId);
        res.status(200).json(todos);
    } catch (error) {
        next(error);
    }
}

async function createTodos(req, res, next) {
    try {
        const userId = req.user.userId;
        const { title, day } = req.body;
        if (!title || title.trim() === "" || !day || day.trim() === "") {
            const error = new Error('Title and day are required');
            error.status = 400;
            return next(error);
        }

        const newTodo = await createTodo(userId, title.trim(), day.trim());
        res.status(201).json(newTodo);
    } catch (error) {
        next(error);
    }
}

async function updateTodos(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { title, completed } = req.body;

        if (!id) {
            const error = new Error('ID is required');
            error.status = 400;
            return next(error);
        }

        let updatedTodo = null;

        if ('completed' in req.body) {
            updatedTodo = await updateTodoStatus(userId, completed, id);
        } else if (title !== undefined) {
            if (!title.trim()) {
                const error = new Error('Title cannot be empty');
                error.status = 400;
                return next(error);
            }
            updatedTodo = await updateTodo(userId, title.trim(), id);
        } else {
            const error = new Error('No valid fields to update (title or completed)');
            error.status = 400;
            return next(error);
        }

        if (!updatedTodo) {
            return next(createNotFoundError(id));
        }

        res.status(200).json(updatedTodo);
    } catch (error) {
        next(error);
    }
}

async function deleteTodos(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        if (!id) {
            const error = new Error('ID is required');
            error.status = 400;
            return next(error);
        }

        const deleted = await deleteTodo(userId, id);
        if (!deleted) {
            return next(createNotFoundError(id));
        }

        res.status(200).json(deleted);
    } catch (error) {
        next(error);
    }
}

async function getStreak(req, res, next) {
    try {
        const userId = req.user.userId;
        const { day } = req.params;
        if (!day) {
            const error = new Error('Day is required');
            error.status = 400;
            return next(error);
        }

        const streak = await fetchCompletedCountByDay(userId, day);
        res.json({ streak });
    } catch (error) {
        next(error);
    }
}

export {
    getTodos,
    createTodos,
    updateTodos,
    deleteTodos,
    getStreak
};