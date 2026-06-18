import { Request, Response } from "express";

export const getHealth = (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    db: "connected" // Mock for now, will integrate prisma later
  });
};
