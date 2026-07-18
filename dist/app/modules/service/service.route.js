"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = require("../../middlewares/validateRequest");
const service_validation_1 = require("./service.validation");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const service_controller_1 = require("./service.controller");
const multer_config_1 = require("../../config/multer.config");
const router = (0, express_1.Router)();
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.PROVIDER), multer_config_1.multerUpload.fields([
    { name: "media" },
    { name: "company_logo", maxCount: 1 },
]), (0, validateRequest_1.validateRequest)(service_validation_1.createServiceZodSchema), service_controller_1.ServiceControllers.createService);
router.get("/all-services", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), service_controller_1.ServiceControllers.getAllServices);
// Get provider's own service
router.get("/my-service", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), service_controller_1.ServiceControllers.getMyService);
// Get service details with all reviews
router.get("/details/:id", service_controller_1.ServiceControllers.getServiceDetailsWithReviews);
// Nearest services (geo-based)
router.post("/nearest", service_controller_1.ServiceControllers.getNearestServices);
// Global search by service name
router.get("/search", service_controller_1.ServiceControllers.searchServices);
router.post("/by-category", service_controller_1.ServiceControllers.getServicesByCategory);
router.get("/:id", service_controller_1.ServiceControllers.getSingleService);
router.patch("/:id", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), multer_config_1.multerUpload.fields([
    { name: "media" },
    { name: "company_logo", maxCount: 1 },
]), (0, validateRequest_1.validateRequest)(service_validation_1.updateServiceZodSchema), service_controller_1.ServiceControllers.updateService);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.PROVIDER), service_controller_1.ServiceControllers.deleteService);
exports.ServiceRoutes = router;
