import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors.js";

export function requireArtist(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user?.isArtist) {
    throw new ForbiddenError("Artist access required");
  }
  next();
}
