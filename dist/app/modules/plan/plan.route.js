"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanRoutes = void 0;
const express_1 = __importDefault(require("express"));
const plan_controller_1 = require("./plan.controller");
const router = express_1.default.Router();
router.get("/", plan_controller_1.PlanController.getAllPlans);
router.get("/:id", plan_controller_1.PlanController.getSinglePlan);
exports.PlanRoutes = router;
