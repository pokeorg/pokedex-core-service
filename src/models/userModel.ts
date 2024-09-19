import { Pool } from 'pg';
import { config } from '../config/config';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  reset_token?: string;
  reset_token_expiry?: number;
}

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
  findByEmail: async (email: string): Promise<User | null> => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      return result.rows[0] || null; // Return null if no user found
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Database query failed');
    }
  },
  
  // Find user by username
  findByUsername: async (username: string): Promise<User | null> => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      return result.rows[0] || null; // Return null if no user found
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw new Error('Database query failed');
    }
  },

  // Create a new user
  createUser: async (username: string, email: string, passwordHash: string): Promise<User | null> => {
    try {
      const result = await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [username, email, passwordHash]
      );
      return result.rows[0] || null; // Return null if user creation failed
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('User creation failed');
    }
  },

  // Update user's password
  updatePassword: async (id: number, passwordHash: string): Promise<void> => {
    try {
      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [passwordHash, id]);
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Password update failed');
    }
  },

  // Set password reset token and expiry for the user
  updateResetToken: async (email: string, resetToken: string, resetTokenExpiry: number): Promise<void> => {
    try {
      await pool.query(
        "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
        [resetToken, resetTokenExpiry, email]
      );
    } catch (error) {
      console.error('Error updating reset token:', error);
      throw new Error('Failed to set reset token');
    }
  },

  // Find a user by their password reset token and ensure the token hasn't expired
  findByResetToken: async (resetToken: string): Promise<User | null> => {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2",
        [resetToken, Date.now()]
      );
      return result.rows[0] || null; // Return null if no user found
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      throw new Error('Failed to find user by reset token');
    }
  },

  // Clear reset token and expiry after successful password reset
  clearResetToken: async (email: string): Promise<void> => {
    try {
      await pool.query(
        "UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE email = $1",
        [email]
      );
    } catch (error) {
      console.error('Error clearing reset token:', error);
      throw new Error('Failed to clear reset token');
    }
  },
  
  // Update the 'password_reset' flag after a successful reset
  updatePasswordResetFlag: async (email: string, passwordReset: boolean): Promise<void> => {
    try {
      await pool.query("UPDATE users SET password_reset = $1 WHERE email = $2", [passwordReset, email]);
    } catch (error) {
      console.error('Error updating password reset flag:', error);
      throw new Error('Failed to update password reset flag');
    }
  },
};