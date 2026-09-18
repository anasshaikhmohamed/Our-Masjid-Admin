import type { NextFunction, Request, Response } from "express";

export function requireAdminBearer(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Supabase administrator session required." });
    return;
  }

  res.locals.supabaseBearer = authorization;
  next();
}