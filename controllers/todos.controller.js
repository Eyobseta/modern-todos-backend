import {
    fetchTodos,
    fetchTodoByDay,
    createTodo,
    updateTodoFields,   
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
        const { day, sortBy } = req.query;

        let orderBy = 'day, created_at'; // default
        if (sortBy === 'due_date') {
            orderBy = 'due_date NULLS LAST, day, created_at';
        }

        if (day) {
            const todos = await fetchTodoByDay(userId, day, orderBy);
            return res.status(200).json(todos);
        }
        const todos = await fetchTodos(userId, orderBy);
        res.status(200).json(todos);
    } catch (error) {
        next(error);
    }
}

async function createTodos(req, res, next) {
    try {
        const userId = req.user.userId;
        const { title, day, due_date } = req.body;

        if (!title || title.trim() === "" || !day || day.trim() === "") {
            const error = new Error('Title and day are required');
            error.status = 400;
            return next(error);
        }

        // Validate due_date if provided (must be YYYY-MM-DD)
        if (due_date && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
            const error = new Error('Due date must be in YYYY-MM-DD format');
            error.status = 400;
            return next(error);
        }

        const newTodo = await createTodo(
            userId, 
            title.trim(), 
            day.trim(), 
            due_date || null  // send null if not provided
        );
        res.status(201).json(newTodo);
    } catch (error) {
        next(error);
    }
}

async function updateTodos(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { title, completed, due_date } = req.body;

        if (!id) {
            const error = new Error('ID is required');
            error.status = 400;
            return next(error);
        }

        // Build fields object with only the provided fields
        const fields = {};
        if (title !== undefined) {
            if (!title.trim()) {
                const error = new Error('Title cannot be empty');
                error.status = 400;
                return next(error);
            }
            fields.title = title;
        }
        if (completed !== undefined) {
            fields.completed = completed;
        }
        if (due_date !== undefined) {
            // Allow setting due_date to null to remove it
            if (due_date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
                const error = new Error('Due date must be in YYYY-MM-DD format');
                error.status = 400;
                return next(error);
            }
            fields.due_date = due_date;
        }

        if (Object.keys(fields).length === 0) {
            const error = new Error('No valid fields to update (title, completed, or due_date)');
            error.status = 400;
            return next(error);
        }

        const updatedTodo = await updateTodoFields(userId, id, fields);

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