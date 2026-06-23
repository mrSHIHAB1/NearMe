import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { SuperAdminController } from "./superAdmin.controller";

const router = Router();


router.get("/dashboard", checkAuth(Role.SUPER_ADMIN), SuperAdminController.getDashboard);
router.get("/service-providers", checkAuth(Role.SUPER_ADMIN), SuperAdminController.getServiceProviders);
router.get("/service-summary", checkAuth(Role.SUPER_ADMIN), SuperAdminController.getServiceSummary);
router.patch(
  "/service-providers/:serviceId/suspend",
  checkAuth(Role.SUPER_ADMIN),
  SuperAdminController.suspendServiceProvider
);

router.patch(
  "/service-providers/:serviceId/unsuspend",
  checkAuth(Role.SUPER_ADMIN),
  SuperAdminController.unsuspendServiceProvider
);
router.delete(
  "/service-providers/:serviceId",
  checkAuth(Role.SUPER_ADMIN),
  SuperAdminController.withdrawServiceProvider
);
router.get("/users", checkAuth(Role.SUPER_ADMIN), SuperAdminController.getUsers);
router.patch("/users/:userId/block", checkAuth(Role.SUPER_ADMIN), SuperAdminController.blockUser);
router.patch("/users/:userId/unblock", checkAuth(Role.SUPER_ADMIN), SuperAdminController.unblockUser);
router.delete("/users/:userId", SuperAdminController.deleteUser);
router.get("/revenue", checkAuth(Role.SUPER_ADMIN), SuperAdminController.getRevenue);

export const SuperAdminRoutes = router;