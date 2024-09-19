//authMiddleware
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const authMiddleware = {
  verifyToken: (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).send("Token is required");

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.body.user = decoded;
      next();
    } catch (err) {
      res.status(401).send("Invalid token");
    }
  },
};
