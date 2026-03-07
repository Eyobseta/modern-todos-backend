import pool from "../config/db.js";

async function fetchTodos(userId, orderBy = 'day, created_at') {
    const query = `SELECT id, title, completed, day, created_at, updated_at, due_date
                   FROM todos
                   WHERE user_id = $1
                   ORDER BY ${orderBy}`; // careful: orderBy must be whitelisted to avoid SQL injection
    const result = await pool.query(query, [userId]);
    return result.rows;
}

async function fetchTodoByDay(userId, day) {
    const query = `SELECT id, title, completed, day, created_at, updated_at ,due_date
                   FROM todos
                   WHERE user_id = $1 AND day = $2
                   ORDER BY created_at`;
    const result = await pool.query(query, [userId, day]);
    return result.rows;
}

async function createTodo(userId, title, day, due_date = null) {
    const query = `INSERT INTO todos (title, day, user_id, due_date) 
                   VALUES ($1, $2, $3, $4) 
                   RETURNING id, title, completed, day, created_at, updated_at, due_date`;
    const result = await pool.query(query, [title.trim(), day.trim(), userId, due_date]);
    return result.rows[0];
}

async function updateTodoFields(userId, id, fields) {
    // fields can contain: title, completed, due_date
    const setClauses = [];
    const values = [];
    let idx = 1;

    if (fields.title !== undefined) {
        setClauses.push(`title = $${idx++}`);
        values.push(fields.title.trim());
    }
    if (fields.completed !== undefined) {
        setClauses.push(`completed = $${idx++}`);
        values.push(fields.completed);
    }
    if (fields.due_date !== undefined) {
        setClauses.push(`due_date = $${idx++}`);
        values.push(fields.due_date); // can be null or a date string
    }
    setClauses.push(`updated_at = NOW()`);

    if (setClauses.length === 1) { // only updated_at? that means no fields provided
        return null; // nothing to update
    }

    const query = `UPDATE todos
                   SET ${setClauses.join(', ')}
                   WHERE id = $${idx++} AND user_id = $${idx++}
                   RETURNING id, title, completed, day, created_at, updated_at, due_date`;
    values.push(id, userId);
    const result = await pool.query(query, values);
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
    updateTodoFields,   
    deleteTodo,
    fetchCompletedCountByDay
};