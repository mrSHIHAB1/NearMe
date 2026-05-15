import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { CategoryControllers } from "./category.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// router.post("/create",  CategoryControllers.createCategory);

router.post("/create",
    checkAuth(Role.SUPER_ADMIN),
    multerUpload.single("image"),
    CategoryControllers.createCategory);

router.get("/tree", CategoryControllers.getCategoryTree);

router.patch("/approve/:id", checkAuth(Role.SUPER_ADMIN), CategoryControllers.approveCategory);

/**
 * GET /categories/search?searchTerm=plumb
 * GET /categories/search?searchTerm=plumb&level=0   ← root categories only
 * GET /categories/search?searchTerm=plumb&level=1   ← sub-categories only
 *
 * Powers:
 *  - Page 1 search bar (all levels or level=0)
 *  - Page 2 "Search sub-categories..." bar (level=1 or level=2, or no level filter)
 */
router.get("/search", CategoryControllers.searchCategories);

/**
 * GET /categories/:id/sub-tree
 *
 * Returns the full children + grandchildren tree for a category.
 * Powers the left panel of page 2 (sub-categories & child categories list).
 */
router.get("/:id/sub-tree", CategoryControllers.getCategorySubTree);

export const CategoryRoutes = router;