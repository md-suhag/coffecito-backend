import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body?.data) {
        try {
          const parsed = JSON.parse(req.body?.data);
          req.body = { ...parsed, ...req.body };
          delete req.body?.data;
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON in 'data' field",
          });
        }
      }
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
      });
      next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequest;
