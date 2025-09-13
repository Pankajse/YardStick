import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../lib/config.js";



declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                tenantId: string;
                role: "ADMIN" | "MEMBER";
                tenantSlug : string;
            };
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  if(!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      userId: string;
      tenantId: string;
      role: "ADMIN" | "MEMBER";
      tenantSlug : string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
