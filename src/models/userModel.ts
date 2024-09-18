import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({
  host: config.db.host,
  user: config.db.user,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
  ssl: config.db.ssl,
});

export const userModel = {
  // Find user by email
  findByEmail: async (email: string) => {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0];
  },
  
  // Find user by username
  findByUsername: async (username: string) => {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0];
  },

  // Create a new user
  createUser: async (username: string, email: string, passwordHash: string) => {
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, passwordHash]
    );
    return result.rows[0];
  },

  // Update user's password
  updatePassword: async (id: number, passwordHash: string) => {
    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [passwordHash, id]
    );
  },

  // Set password reset token and expiry for the user
  updateResetToken: async (email: string, resetToken: string, resetTokenExpiry: number) => {
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
      [resetToken, resetTokenExpiry, email]
    );
  },

  // Find a user by their password reset token and ensure the token hasn't expired
  findByResetToken: async (resetToken: string) => {
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2",
      [resetToken, Date.now()]
    );
    return result.rows[0];
  },

  // Clear reset token and expiry after successful password reset
  clearResetToken: async (email: string) => {
    await pool.query(
      "UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE email = $1",
      [email]
    );
  },
  
  // Update the 'password_reset' flag after a successful reset
  updatePasswordResetFlag: async (email: string, passwordReset: boolean) => {
    await pool.query(
      "UPDATE users SET password_reset = $1 WHERE email = $2",
      [passwordReset, email]
    );
  },
};