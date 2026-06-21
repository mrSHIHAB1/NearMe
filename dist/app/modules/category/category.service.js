"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryServices = exports.getAllDescendantCategoryIds = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const category_model_1 = require("./category.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const cloudinary_config_1 = require("../../config/cloudinary.config");
const createCategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, parent, isCustom, image } = payload;
    let level = 0;
    if (!name) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "No name is given");
    }
    if (parent) {
        const parentCategory = yield category_model_1.Category.findById(parent);
        if (!parentCategory) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parent not found");
        }
        level = (parentCategory.level + 1);
        if (level > 2) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Max 3 level allowed");
        }
    }
    const category = yield category_model_1.Category.create({
        name,
        parent: parent || null,
        level,
        isCustom: isCustom || false,
        isApproved: !isCustom, // custom = pending
        image: image || ""
    });
    return category;
});
const getCategoryTree = () => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield category_model_1.Category.find({ isApproved: true }).lean();
    const map = new Map();
    categories.forEach((category) => {
        map.set(category._id.toString(), Object.assign(Object.assign({}, category), { children: [] }));
    });
    const tree = [];
    categories.forEach((category) => {
        var _a;
        if (category.parent) {
            (_a = map.get(category.parent.toString())) === null || _a === void 0 ? void 0 : _a.children.push(map.get(category._id.toString()));
        }
        else {
            tree.push(map.get(category._id.toString()));
        }
    });
    return tree;
});
const approveCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.Category.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    return category;
});
/**
 * Search categories by name with optional level filter.
 *
 * @param searchTerm  - partial name to search (regex, word-start anchored)
 * @param level       - 0 | 1 | 2  (omit to search all levels)
 *
 * Returns flat array of matching categories (no tree nesting).
 * The client uses level info to decide how to render each result.
 */
const searchCategories = (searchTerm, level) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { isApproved: true };
    if (searchTerm) {
        // word-start anchor keeps results relevant (matches "Plumbing" not "Stumbling")
        query.name = { $regex: `\\b${searchTerm}`, $options: "i" };
    }
    if (level !== undefined && [0, 1, 2].includes(level)) {
        query.level = level;
    }
    const categories = yield category_model_1.Category.find(query)
        .populate("parent", "name level")
        .lean();
    return categories;
});
/**
 * Returns the full sub-tree rooted at a given category id.
 *
 * Structure returned:
 * {
 *   _id, name, level,
 *   children: [          ← level-1 sub-categories
 *     { _id, name, level, children: [...] }   ← level-2 child categories
 *   ]
 * }
 *
 * Used to build the left panel on page-2:
 *   - top node  = the clicked root category
 *   - children  = sub-categories (Plumbing, Electrical …)
 *   - grandchildren = child categories (General Plumbing, Drain Cleaning …)
 */
const getCategorySubTree = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const root = yield category_model_1.Category.findById(categoryId).lean();
    if (!root) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Category not found");
    }
    // Fetch all approved descendants in two queries (avoids recursion cost)
    const children = yield category_model_1.Category.find({
        parent: categoryId,
        isApproved: true,
    }).lean();
    const childIds = children.map((c) => c._id);
    const grandChildren = yield category_model_1.Category.find({
        parent: { $in: childIds },
        isApproved: true,
    }).lean();
    // Group grandchildren under their parent
    const grandChildMap = new Map();
    grandChildren.forEach((gc) => {
        const key = gc.parent.toString();
        if (!grandChildMap.has(key))
            grandChildMap.set(key, []);
        grandChildMap.get(key).push(Object.assign(Object.assign({}, gc), { children: [] }));
    });
    const tree = Object.assign(Object.assign({}, root), { children: children.map((child) => {
            var _a;
            return (Object.assign(Object.assign({}, child), { children: (_a = grandChildMap.get(child._id.toString())) !== null && _a !== void 0 ? _a : [] }));
        }) });
    return tree;
});
/**
 * Internal utility: collect all descendant category IDs for a given root.
 * Exported so service.service.ts can reuse it.
 */
const getAllDescendantCategoryIds = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const ids = [categoryId];
    const children = yield category_model_1.Category.find({
        parent: categoryId,
        isApproved: true,
    }).lean();
    const childIds = children.map((c) => c._id.toString());
    ids.push(...childIds);
    if (childIds.length > 0) {
        const grandChildren = yield category_model_1.Category.find({
            parent: { $in: childIds },
            isApproved: true,
        }).lean();
        grandChildren.forEach((gc) => ids.push(gc._id.toString()));
    }
    return ids;
});
exports.getAllDescendantCategoryIds = getAllDescendantCategoryIds;
const updateCategory = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.Category.findById(id);
    if (!category) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Category not found");
    }
    const updatedCategory = yield category_model_1.Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (payload.image && category.image) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(category.image);
    }
    return updatedCategory;
});
exports.CategoryServices = {
    createCategory,
    getCategoryTree,
    approveCategory,
    searchCategories,
    getCategorySubTree,
    updateCategory
};
