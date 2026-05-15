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
  checkAuth(Role.SUPER_ADMIN),
  ServiceControllers.getAllServices
);

// Nearest services (geo-based)
router.post("/nearest", ServiceControllers.getNearestServices);

// Global search by service name
router.get("/search", ServiceControllers.searchServices);

/**
 * POST /services/by-category
 *
 * Powers page 2 right panel — returns services under a category tree.
 *
 * Body:
 * {
 *   categoryId:      string        ← required
 *   lon:             string        ← required
 *   lat:             string        ← required
 *   offerServiceIds: string[]      ← optional. Specific sub/child IDs from checkboxes.
 *   searchTerm:      string        ← optional. Filter by service name.
 *   minRating:       number        ← optional. e.g. 4.0
 *   radius:          number        ← optional. Miles. Default: no radius cap.
 *   availability:    boolean       ← optional. true = open now only.
 * }
 */
router.post("/by-category", ServiceControllers.getServicesByCategory);

router.get("/:id", ServiceControllers.getSingleService);

router.patch(
  "/:id",
  checkAuth(Role.PROVIDER),
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