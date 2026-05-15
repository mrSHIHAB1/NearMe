import { Router } from "express";
import { HighlightServiceControllers } from "./highlight_service.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createHighlightServiceZodSchema, updateHighlightServiceZodSchema } from "./highlight_service.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
    "/",
    checkAuth(Role.PROVIDER),
    multerUpload.single("image"),
    validateRequest(createHighlightServiceZodSchema),
    HighlightServiceControllers.createHighlight
);

router.get(
  "/service/:serviceId",
  HighlightServiceControllers.getHighlightsByService
);

router.get(
  "/:id",
  HighlightServiceControllers.getSingleHighlight
);

router.patch(
    "/:id",
    checkAuth(Role.PROVIDER),
    multerUpload.single("image"),
    validateRequest(updateHighlightServiceZodSchema),
    HighlightServiceControllers.updateHighlight
);

router.delete(
    "/:id",
    checkAuth(Role.PROVIDER),
    HighlightServiceControllers.deleteHighlight
);

export const HighlightServiceRoutes = router;