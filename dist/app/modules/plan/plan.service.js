"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanService = void 0;
const plan_model_1 = require("./plan.model");
const getAllPlans = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield plan_model_1.Plan.find({ isActive: true }).sort({ price: 1 });
    return result;
});
const getSinglePlan = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield plan_model_1.Plan.findById(id);
    return result;
});
const getPlanByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return yield plan_model_1.Plan.findOne({
        name,
        isActive: true,
    });
});
exports.PlanService = {
    getAllPlans,
    getSinglePlan,
    getPlanByName,
};
