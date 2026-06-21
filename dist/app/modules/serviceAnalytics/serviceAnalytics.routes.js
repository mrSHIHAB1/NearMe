"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceAnalyticsRoutes = void 0;
const express_1 = require("express");
const serviceAnalytics_controller_1 = require("./serviceAnalytics.controller");
const user_interface_1 = require("../user/user.interface");
const checkAuth_1 = require("../../middlewares/checkAuth");
const router = (0, express_1.Router)();
/**
 * POST /api/v1/analytics/track
 * Publicly accessible (optionally authenticated).
 * Called by frontend when a service card appears (impression) or is opened (view).
 */
router.post('/track', serviceAnalytics_controller_1.ServiceAnalyticsController.trackEvent);
/**
 * GET /api/v1/analytics/dashboard
 * Provider-only. Returns impression/view data based on plan.
 */
router.get('/dashboard', (0, checkAuth_1.checkAuth)(user_interface_1.Role.PROVIDER, user_interface_1.Role.SUPER_ADMIN), serviceAnalytics_controller_1.ServiceAnalyticsController.getDashboardAnalytics);
exports.ServiceAnalyticsRoutes = router;
