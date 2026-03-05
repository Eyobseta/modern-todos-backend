import pool from "../config/db.js";

async function fetchTodos(userId) {
    const query = `SELECT id, title, completed, day, created_at, updated_at 
                   FROM todos
                   WHERE user_id = $1
                   ORDER BY day, created_at`;
    const result = await pool.query(query, [userId]);
    return result.rows;
}

async function fetchTodoByDay(userId, day) {
    const query = `SELECT id, title, completed, day, created_at, updated_at 
                   FROM todos
                   WHERE user_id = $1 AND day = $2
                   ORDER BY created_at`;
    const result = await pool.query(query, [userId, day]);
    return result.rows;
}

async function createTodo(userId, title, day) {
    const query = `INSERT INTO todos (title, day, user_id) 
                   VALUES ($1, $2, $3) 
                   RETURNING id, title, completed, day, created_at, updated_at`;
    const result = await pool.query(query, [title, day, userId]);
    return result.rows[0];
}

async function updateTodoStatus(userId, completed, id) {
    const query = `UPDATE todos
                   SET completed = $1, updated_at = NOW()
                   WHERE id = $2 AND user_id = $3
                   RETURNING id, title, completed, day, created_at, updated_at`;
    const result = await pool.query(query, [completed, id, userId]);
    return result.rows[0];
}

async function updateTodo(userId, title, id) {
    const query = `UPDATE todos
                   SET title = $1, updated_at = NOW()
                   WHERE id = $2 AND user_id = $3
                   RETURNING id, title, completed, day, created_at, updated_at`;
    const result = await pool.query(query, [title, id, userId]);
    return result.rows[0];
}

async function deleteTodo(userId, id) {
    const query = `DELETE FROM todos 
                   WHERE id = $1 AND user_id = $2
                   RETURNING id`;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
}

async function fetchCompletedCountByDay(userId, day) {
    const query = `SELECT COUNT(*)
                   FROM todos
                   WHERE user_id = $1 AND day = $2 AND completed = true`;
    const result = await pool.query(query, [userId, day]);
    return parseInt(result.rows[0].count);
}

export {
    fetchTodos,
    fetchTodoByDay,
    createTodo,
    updateTodoStatus,
    updateTodo,
    deleteTodo,
    fetchCompletedCountByDay
};