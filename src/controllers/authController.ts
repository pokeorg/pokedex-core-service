import { Request, Response } from "express";
import { signUp, login, forgotPassword, resetPassword } from "../services/authService";

export const authController = {
  signUp: async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;
      const token = await signUp(username, password, email);
      res.status(201).json({ token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const { usernameOrEmail, password } = req.body;
      const token = await login(usernameOrEmail, password);
      res.status(200).json({ token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await forgotPassword(email);
      res.status(200).json({ message: "Reset password link sent" });
    } catch (error: any) {
      res.status(400).json({ error: error.message }); 
    }
  },
    resetPassword: async (req: Request, res: Response) => {
      try {
        const { token, newPassword } = req.body;
        await resetPassword(token, newPassword);
        res.status(200).json({ message: 'Password updated' });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    },
};
