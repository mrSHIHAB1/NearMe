import { Plan } from "./plan.model";
import { TPlanName } from "./plan.interface";

const getAllPlans = async () => {
  const result = await Plan.find({ isActive: true }).sort({ price: 1 });
  return result;
};

const getSinglePlan = async (id: string) => {
  const result = await Plan.findById(id);
  return result;
};


const getPlanByName = async (name: TPlanName) => {
  return await Plan.findOne({
    name,
    isActive: true,
  });
};

export const PlanService = {
  getAllPlans,
  getSinglePlan,
  getPlanByName,
};