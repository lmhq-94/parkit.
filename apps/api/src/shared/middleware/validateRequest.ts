import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// Middleware factory: validates request body against provided Zod schema
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.flatten(),
        });
      }
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.message,
        });
      }
      return res.status(400).json({
        success: false,
        message: "Validation failed",
      });
    }
  };
}
