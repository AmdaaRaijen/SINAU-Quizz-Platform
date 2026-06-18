import { Router } from "express";
import { validate } from "./question-set.controller";

const router = Router();

router.post("/validate", validate);

export { router as questionSetRoutes };
