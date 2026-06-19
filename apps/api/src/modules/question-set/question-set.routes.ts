import { Router } from "express";
import { validate, getById } from "./question-set.controller";

const router = Router();

router.post("/validate", validate);
router.get("/:id", getById);

export { router as questionSetRoutes };
