import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createServiceZodSchema,
  updateServiceZodSchema,
} from "./service.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { ServiceControllers } from "./service.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.PROVIDER),
  multerUpload.fields([
    { name: "media" },
    { name: "company_logo", maxCount: 1 },
  ]),
  validateRequest(createServiceZodSchema),
  ServiceControllers.createService
);

router.get(
  "/all-services",
  checkAuth(...Object.values(Role)),
  ServiceControllers.getAllServices
);

// Get provider's own service
router.get(
  "/my-service",
  checkAuth(...Object.values(Role)),
  ServiceControllers.getMyService
);

// Get service details with all reviews
router.get(
  "/details/:id",
  ServiceControllers.getServiceDetailsWithReviews
);

// Nearest services (geo-based)
router.post("/nearest", ServiceControllers.getNearestServices);

// Global search by service name
router.get("/search", ServiceControllers.searchServices);
router.post("/by-category", ServiceControllers.getServicesByCategory);
router.get("/:id", ServiceControllers.getSingleService);

router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  multerUpload.fields([
    { name: "media" },
    { name: "company_logo", maxCount: 1 },
  ]),
  validateRequest(updateServiceZodSchema),
  ServiceControllers.updateService
);

router.delete(
  "/:id",
  checkAuth(Role.PROVIDER),
  ServiceControllers.deleteService
);

export const ServiceRoutes = router;
