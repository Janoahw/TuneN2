import type { Request, Response, NextFunction } from 'express';
import { type AnyZodObject, type ZodTypeAny, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

interface ValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: AnyZodObject;
}

export function validate(schema: ValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        const validatedQuery = await schema.query.parseAsync(req.query);
        (req as any).validatedQuery = validatedQuery;
      }
      if (schema.params) {
        const validatedParams = await schema.params.parseAsync(req.params);
        (req as any).validatedParams = validatedParams;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        next(new ValidationError('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
}
