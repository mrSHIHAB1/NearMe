import { Router } from 'express';
import { ServiceAnalyticsController } from './serviceAnalytics.controller';

import { Role } from '../user/user.interface';
import { checkAuth } from '../../middlewares/checkAuth';

const router = Router();

/**
 * POST /api/v1/analytics/track
 * Publicly accessible (optionally authenticated).
 * Called by frontend when a service card appears (impression) or is opened (view).
 */
router.post('/track', ServiceAnalyticsController.trackEvent);

/**
 * GET /api/v1/analytics/dashboard
 * Provider-only. Returns impression/view data based on plan.
 */
router.get(
  '/dashboard',
  checkAuth(Role.PROVIDER, Role.SUPER_ADMIN),
  ServiceAnalyticsController.getDashboardAnalytics
);

export const ServiceAnalyticsRoutes = router;