/** @format */

import dotenv from "dotenv";
import cors from 'cors';
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

let pool: Pool;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// ========================= UTILITY FUNCTIONS =========================
const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const validateUserName = (username: string): boolean => {
  const usernameRegex = /[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const validatePassword = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
  return passwordRegex.test(password);
};



const validateEmailAndUsernameUniqueness = async (email: string, username: string): Promise<{ emailExists: boolean, usernameExists: boolean }> => {
  const result = await pool.query(
    `SELECT 
       (SELECT COUNT(id) FROM users WHERE email = $1) AS email_count, 
       (SELECT COUNT(id) FROM users WHERE username = $2) AS username_count`,
    [email, username]
  );
  
  const emailExists = result.rows[0].email_count > 0;
  const usernameExists = result.rows[0].username_count > 0;
  
  return { emailExists, usernameExists };
};

const createUser = async ({
  username,
  email,
  passwordHash,
}: {
  username: string;
  email: string;
  passwordHash: string;
}): Promise<any> => {
  const result = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
    [username, email, passwordHash]
  );
  return result.rows[0];
};

// Add CORS middleware
app.use(cors({
  origin: 'http://localhost:5174', // Allow requests from your frontend URL
  credentials: true, // Allow cookies and headers
}));

const getPasswordHash = (plaintextPassword: string): string => {
  const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
  return bcrypt.hashSync(plaintextPassword, saltRounds);
};

const comparePasswordHash = (
  plaintextPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plaintextPassword, hashedPassword);
};

// ========================= HANDLERS =========================
const signUpHandler = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    // Check if email or username is already in use
    const { emailExists, usernameExists } = await validateEmailAndUsernameUniqueness(email, username);
    if (emailExists && usernameExists) {
      return res.status(409).json({ error: "Both email and username are already in use." });
    }
    if (emailExists) {
      return res.status(409).json({ error: "Email is already in use." });
    }
    if (usernameExists) {
      return res.status(409).json({ error: "Username is already in use." });
    }
    //Validate email format
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) throw new Error("Email is invalid");
    // Validate username format
    const isUsernameValid = validateUserName(username);
    if (!isUsernameValid) throw new Error("Username is invalid");
    // Validate password format
    const isPasswordValid = validatePassword(password);
    if (!isPasswordValid) throw new Error("Password is invalid");
    // Create user
    const passwordHash = getPasswordHash(password);
    const user = await createUser({ username, passwordHash, email });
    // Generate JWT
    const jwtSecret: string = process.env.JWT_SECRET || "";
    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
      expiresIn: "1h",
    });

    res.status(201).send({ token });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
};

const loginHandler = async (req: Request, res: Response) => {
  try {
    console.log('Request body:', req.body); // Log the entire request body

    // Extract fields from request body
    const {email, password } = req.body;

    console.log('Login attempt:', { email, password });

    // Check if usernameOrEmail and password are provided
    if (!email) {
      console.log('email is missing');
      return res.status(400).send({ error: "Email is required" });
    }
    if (!password) {
      return res.status(400).send({ error: "Password is required" });
    }

    // Validate if it's an email
    const isEmail = validateEmail(email);
    console.log('Is email:', isEmail);

    // Determine the query based on whether it's an email or username
    let userQuery = `SELECT * FROM users WHERE ${
      isEmail ? "email" : "username"
    } = $1`;

    const result = await pool.query(userQuery, [email]);
    console.log('Query result:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).send({ error: "User not found" });
    }

    const user = result.rows[0] as unknown as {
      id: number;
      email: string;
      password: string;
    };

    // Validate password
    const isPasswordValid = await comparePasswordHash(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).send({ error: "Incorrect Password" });
    }

    // Generate JWT token
    const jwtSecret: string = process.env.JWT_SECRET || "";
    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
      expiresIn: "1h",
    });

    res.status(200).send({ token });
  } catch (error: any) {
    console.error('Error:', error.message);
    res.status(500).send({ error: error.message });
  }
};


// ========================= ROUTES =========================
app.post("/signup", signUpHandler);
app.post("/login", loginHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    ssl: true,
  });

  console.log(`Server running on port ${PORT}`);
});
