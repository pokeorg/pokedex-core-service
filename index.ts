/** @format */

import dotenv from "dotenv";
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

const validateEmailUniqueness = async (email: string): Promise<boolean> => {
  const result = await pool.query(
    `SELECT COUNT(id) FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0].count === "0";
};

const validateUsernameUniqueness = async (
  username: string
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT COUNT(id) FROM users WHERE username = $1`,
    [username]
  );
  return result.rows[0].count === "0";
};

const validateEmailAndUsernameUniqueness = async (
  email: string,
  username: string
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT COUNT(id) FROM users WHERE email = $1 OR username = $2`,
    [email, username]
  );
  return result.rows[0].count === "0";
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

    if (!username) throw new Error("Username missing");
    if (!password) throw new Error("Password missing");
    if (!email) throw new Error("Email missing");

    const isEmailValid = validateEmail(email);
    if (!isEmailValid) throw new Error("Email is invalid");

    const isUsernameValid = validateUserName(username);
    if (!isUsernameValid) throw new Error("Username is invalid");

    const isEmailOrPasswordUnique = await validateEmailAndUsernameUniqueness(
      email,
      username
    );
    if (!isEmailOrPasswordUnique)
      throw new Error("Email or username already in use");

    const isPasswordValid = validatePassword(password);
    if (!isPasswordValid) throw new Error("Password is invalid");

    const passwordHash = getPasswordHash(password);

    const user = await createUser({ username, passwordHash, email });

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
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail) {
      return res.status(400).send({ error: "Username Or Email is required" });
    }
    if (!password) {
      return res.status(400).send({ error: "Password is required" });
    }

    const isEmail = validateEmail(usernameOrEmail);

    let userQuery = `SELECT * FROM users WHERE ${
      isEmail ? "email" : "username"
    } = $1`;

    const result = await pool.query(userQuery, [usernameOrEmail]);

    if (result.rows.length === 0) {
      return res.status(404).send({ error: "User not found" });
    }

    const user = result.rows[0] as unknown as {
      id: number;
      email: string;
      password: string;
    };

    const isPasswordValid = await comparePasswordHash(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({ error: "Incorrect Password" });
    }

    const jwtSecret: string = process.env.JWT_SECRET || "";
    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
      expiresIn: "1h",
    });

    res.status(200).send({ token });
  } catch (error: any) {
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
