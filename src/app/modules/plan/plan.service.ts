import { Plan } from "./plan.model";

const getAllPlans = async () => {
  const result = await Plan.find({ isActive: true }).sort({ price: 1 });
  return result;
};

const getSinglePlan = async (id: string) => {
  const result = await Plan.findById(id);
  return result;
};

const getPlanByName = async (name: string) => {
  const result = await Plan.findOne({ name, isActive: true });
  return result;
};

export const PlanService = {
  getAllPlans,
  getSinglePlan,
  getPlanByName,
};