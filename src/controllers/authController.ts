// authController.ts

import { Request, Response, NextFunction } from "express";
import { signUp, login, forgotPassword, resetPassword } from "../services/authService";
import passport from "passport";
import { User } from "../models/userModel"; // Import your User type if available

// Define types for Passport callback
interface PassportCallback {
  (err: any, user: User | false, info: any): void;
}

// Define and export controller functions
export const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { failureRedirect: '/login' }, (err: any, user: User | false, info: any) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');
    req.logIn(user, (err: any) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
};

export const githubLogin = passport.authenticate('github', { scope: ['user:email'] });

export const githubCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('github', { failureRedirect: '/login' }, (err: any, user: User | false, info: any) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');
    req.logIn(user, (err: any) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
};

// Other functions (signUp, login, forgotPassword, resetPassword)
export const signUpController = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const token = await signUp(username, password, email);
    res.json({ token });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const token = await login(usernameOrEmail, password);
    res.json({ token });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    await forgotPassword(email);
    res.json({ message: "Password reset email sent" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    await resetPassword(token, newPassword);
    res.json({ message: "Password has been reset" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

