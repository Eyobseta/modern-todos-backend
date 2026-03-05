import { createUser, findUserByEmail, findUserById } from "../repositories/users.repositories.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Register
async function register(req, res, next) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            const error = new Error('Username, email and password are required');
            error.status = 400;
            return next(error);
        }

        // Check if user already exists
        const existing = await findUserByEmail(email);
        if (existing) {
            const error = new Error('User with this email already exists');
            error.status = 409;
            return next(error);
        }

        const user = await createUser({ username, email, password });
        // Generate token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token });
    } catch (error) {
        next(error);
    }
}

// Login
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            const error = new Error('Email and password are required');
            error.status = 400;
            return next(error);
        }

        const user = await findUserByEmail(email);
        if (!user) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            return next(error);
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            return next(error);
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        // Don't send password hash
        const { password_hash, ...userData } = user;
        res.json({ user: userData, token });
    } catch (error) {
        next(error);
    }
}

// Get current user (optional, for token validation)
async function me(req, res, next) {
    try {
        const user = await findUserById(req.user.userId);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            return next(error);
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
}

export { register, login, me };