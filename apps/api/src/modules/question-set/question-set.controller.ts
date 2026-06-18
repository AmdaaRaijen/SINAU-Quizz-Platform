import { Request, Response, NextFunction } from "express";
import { validateQuestionSet } from "./question-set.service";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = validateQuestionSet(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
