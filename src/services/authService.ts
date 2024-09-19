//authService
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel";
import crypto from "crypto";
import { config } from "../config/config";
import { sendResetPasswordEmail } from "./emailService";
import { hashPassword, verifyPassword } from "../utils/passwordUtils";
import { validateEmail } from "../utils/validationUtils";

const generateResetToken = (): string => crypto.randomBytes(32).toString("hex");

export const signUp = async (username: string, password: string, email: string): Promise<string> => {
  const emailExists = await userModel.findByEmail(email);
  const usernameExists = await userModel.findByUsername(username);

  if (emailExists) throw new Error("Email is already in use.");
  if (usernameExists) throw new Error("Username is already in use.");

  const passwordHash = hashPassword(password);
  const user = await userModel.createUser(username, email, passwordHash);

  if (!user) throw new Error("User creation failed"); // Add a null check here

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: "1h" }
  );

  return token;
};

export const login = async (usernameOrEmail: string, password: string): Promise<string> => {
  const isEmail = validateEmail(usernameOrEmail);
  const user = isEmail
    ? await userModel.findByEmail(usernameOrEmail)
    : await userModel.findByUsername(usernameOrEmail);

  if (!user) throw new Error('User not found');

  const isPasswordValid = verifyPassword(password, user.password);
  if (!isPasswordValid) throw new Error("Incorrect password");

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: "1h" }
  );

  return token;
};

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await userModel.findByEmail(email);
  if (!user) throw new Error("User not found");

  const resetToken = generateResetToken();
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour

  await userModel.updateResetToken(email, resetToken, resetTokenExpiry);
  await sendResetPasswordEmail(email, resetToken);
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const user = await userModel.findByResetToken(token);
  if (!user) throw new Error("Invalid or expired token");

  if (user.reset_token_expiry === undefined || user.reset_token_expiry <= Date.now()) {
    throw new Error('The reset token has expired. Please request a new password reset.');
  }

  const passwordHash = hashPassword(newPassword);
  
  if (typeof user.id !== 'number') {
    throw new Error('User ID should be a number');
  }

  await userModel.updatePassword(user.id, passwordHash);
  await userModel.updateResetToken(user.email, "", 0); // Clear reset token
};





































// /** @format */

// import jwt from "jsonwebtoken";
// import { userModel } from "../models/userModel";
// import crypto from "crypto";
// import { config } from "../config/config";
// import { sendResetPasswordEmail } from "./emailService";
// import { hashPassword, verifyPassword } from "../utils/passwordUtils";
// import { validateEmail } from "../utils/validationUtils";


// // Helper function to generate a reset token
// const generateResetToken = () => {
//   return crypto.randomBytes(32).toString("hex");
// };

// export const signUp = async (
//   username: string,
//   password: string,
//   email: string
// ) => {
//   const emailExists = await userModel.findByEmail(email);
//   const usernameExists = await userModel.findByEmail(username);

//   if (emailExists) throw new Error("Email is already in use.");
//   if (usernameExists) throw new Error("Username is already in use.");

//   const passwordHash = hashPassword(password);
//   const user = await userModel.createUser(username, email, passwordHash);

//   const token = jwt.sign(
//     { userId: user.id, email: user.email },
//     config.jwtSecret,
//     { expiresIn: "1h" }
//   );

//   return token;
// };

// export const login = async (usernameOrEmail: string, password: string) => {
//   const isEmail = validateEmail(usernameOrEmail);
//   const user = isEmail
//      await userModel.findByEmail(usernameOrEmail) ? symbol before !await like this
//     : await userModel.findByUsername(usernameOrEmail);
//     if (!user) throw new Error('User not found');

//   const isPasswordValid = verifyPassword(password, user.password);
//   if (!isPasswordValid) throw new Error("Incorrect password");

//   const token = jwt.sign(
//     { userId: user.id, email: user.email },
//     config.jwtSecret,
//     { expiresIn: "1h" }
//   );

//   return token;
// };

// export const forgotPassword = async (email: string) => {
//   const user = await userModel.findByEmail(email);
//   if (!user) throw new Error("User not found");

//   const resetToken = generateResetToken();
//   const resetTokenExpiry = Date.now() + 3600000; // 1 hour

//   console.log(`Token generated at: ${new Date(Date.now()).toLocaleString()}`);
//   console.log(`Token expiry time (timestamp): ${resetTokenExpiry}`);
//   console.log(`Token expiry time (human-readable): ${new Date(resetTokenExpiry).toLocaleString()}`);

//   await userModel.updateResetToken(email, resetToken, resetTokenExpiry);
//   await sendResetPasswordEmail(email, resetToken);
// };

// export const resetPassword = async (token: string, newPassword: string) => {
//   const user = await userModel.findByResetToken(token);
  
//   if (!user) throw new Error("User not found");
  
//   console.log(`Current server time: ${new Date(Date.now()).toLocaleString()}`);
//   console.log(`Token expiry from DB (timestamp): ${user.reset_token_expiry}`);
//   console.log(`Token expiry from DB (human-readable): ${new Date(user.reset_token_expiry).toLocaleString()}`);

//   // Token validation logic
//   if (
   //user || //enter not ! symbol before !user like this
//     user.reset_token !== token ||
//     user.reset_token_expiry <= Date.now()
//   ) {
//     console.log("Token is either invalid or expired");
//     throw new Error("Invalid or expired token");
//   }

//   const passwordHash = hashPassword(newPassword);
//   await userModel.updatePassword(user.id, passwordHash);
//   await userModel.updateResetToken(user.email, "", 0); // Clear reset token and expiry
// };
