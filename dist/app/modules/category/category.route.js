"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const category_controller_1 = require("./category.controller");
const multer_config_1 = require("../../config/multer.config");
const router = (0, express_1.Router)();
// router.post("/create",  CategoryControllers.createCategory);
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), multer_config_1.multerUpload.single("image"), category_controller_1.CategoryControllers.createCategory);
router.get("/tree", category_controller_1.CategoryControllers.getCategoryTree);
router.patch("/approve/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), category_controller_1.CategoryControllers.approveCategory);
/**
 * GET /categories/search?searchTerm=plumb
 * GET /categories/search?searchTerm=plumb&level=0   ← root categories only
 * GET /categories/search?searchTerm=plumb&level=1   ← sub-categories only
 *
 * Powers:
 *  - Page 1 search bar (all levels or level=0)
 *  - Page 2 "Search sub-categories..." bar (level=1 or level=2, or no level filter)
 */
router.get("/search", category_controller_1.CategoryControllers.searchCategories);
/**
 * GET /categories/:id/sub-tree
 *
 * Returns the full children + grandchildren tree for a category.
 * Powers the left panel of page 2 (sub-categories & child categories list).
 */
router.get("/:id/sub-tree", category_controller_1.CategoryControllers.getCategorySubTree);
exports.CategoryRoutes = router;
