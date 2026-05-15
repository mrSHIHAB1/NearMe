import { Router } from "express";
import { ReviewControllers } from "./review.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createReviewZodSchema } from "./review.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.USER, Role.PROVIDER),
  validateRequest(createReviewZodSchema),
  ReviewControllers.createReview
);

router.get(
  "/service/:serviceId",
  ReviewControllers.getServiceReviews
);

router.delete(
  "/:id",
  checkAuth(Role.USER, Role.PROVIDER, Role.SUPER_ADMIN),
  ReviewControllers.deleteReview
);

export const ReviewRoutes = router;