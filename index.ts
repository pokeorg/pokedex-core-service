/** @format */

import dotenv from "dotenv";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

let pool: Pool;

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
    `select count(id) from users where email = '${email}'`
  );
  return result.rows[0].count === 0;
};

const validateUsernameUniqueness = async (
  username: string
): Promise<boolean> => {
  const result = await pool.query(
    `select count(id) from users where username = '${username}'`
  );
  return result.rows[0].count === 0;
};

const validateEmailAndUsernameUniqueness = async (
  email: string,
  username: string
): Promise<boolean> => {
  const result = await pool.query(
    `select count(id) from users where email = $1 or username = $2`,
    [email, username]
  );
  return result.rows[0].count == 0;
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
    "insert into users (username, email, password) values ($1, $2, $3) returning *",
    [username, email, passwordHash]
  );
  return result.rows[0];
};

const getPasswordHash = (plaintextPassword: string): string => {
  const saltRounds = Number(process.env.SALT_ROUNDS);
  return bcrypt.hashSync(plaintextPassword, saltRounds);
};

const comparePasswordHash = (
  plaintextPassword: string,
  hashedPassword: string
): boolean => {
  return bcrypt.compareSync(plaintextPassword, hashedPassword);
};

const signUpHandler = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    if (!username) throw new Error("Username missing");
    if (!password) throw new Error("Password missing");
    if (!email) throw new Error("Email missing");

    // check if email is valid
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) throw new Error("Email is invalid");

    // check is username is valid
    // TODO: complete this functionality
    const isUsernameValid = validateUserName(username);
    if (!isUsernameValid) throw new Error("Username is invalid");

    // check email or password uniqueness
    const isEmailOrPasswordUnique = await validateEmailAndUsernameUniqueness(
      email,
      username
    );
    if (!isEmailOrPasswordUnique)
      throw new Error("Email or username already in use");

    // check if password is valid
    // TODO: complete this functionality
    const isPasswordValid = validatePassword(password);
    if (!isPasswordValid) throw new Error("Password is invalid");

    // generate hash of password
    const passwordHash = getPasswordHash(password);

    // Create the user and get the newly created user object
    const user = await createUser({ username, passwordHash, email });

    // Generate JWT token
    const jwtSecret: string = process.env.JWT_SECRET || "";
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: "1h" } //
    );

    // Send token in response
    res.status(201).send({ token });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
};

app.post("/signup", signUpHandler);

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


