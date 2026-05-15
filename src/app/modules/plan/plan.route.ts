import express from "express";
import { PlanController } from "./plan.controller";

const router = express.Router();

router.get("/", PlanController.getAllPlans);
router.get("/:id", PlanController.getSinglePlan);

export const PlanRoutes = router;