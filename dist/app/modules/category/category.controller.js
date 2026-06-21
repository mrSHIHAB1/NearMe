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
exports.CategoryControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const category_service_1 = require("./category.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createCategory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // console.log("this is from createCategory:",req.body);
    const payload = Object.assign(Object.assign({}, req.body), { image: ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) || "" });
    const result = yield category_service_1.CategoryServices.createCategory(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Category created successfully",
        data: result,
    });
}));
const getCategoryTree = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_service_1.CategoryServices.getCategoryTree();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Category tree retrieved",
        data: result,
    });
}));
const approveCategory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_service_1.CategoryServices.approveCategory(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Category approved",
        data: result,
    });
}));
/**
 * GET /categories/search?searchTerm=plumb&level=0
 *
 * Searches categories by name. Optionally filter by level:
 *   level=0  → root categories only   (page-1 search)
 *   level=1  → sub-categories only
 *   level=2  → child categories only
 * Omit level to search across all levels (page-2 search)
 */
const searchCategories = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, level } = req.query;
    const result = yield category_service_1.CategoryServices.searchCategories(searchTerm, level !== undefined ? parseInt(level) : undefined);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Categories retrieved successfully",
        data: result,
    });
}));
/**
 * GET /categories/:id/sub-tree
 *
 * Returns the full sub-tree (children + grandchildren) of a given category.
 * Used to populate the left panel on page-2 (sub-categories + child categories).
 */
const getCategorySubTree = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_service_1.CategoryServices.getCategorySubTree(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Category sub-tree retrieved successfully",
        data: result,
    });
}));
const updateCategory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    const payload = Object.assign(Object.assign({}, req.body), { image: ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) || req.body.image // If no new image is provided, keep the existing image
     });
    const result = yield category_service_1.CategoryServices.updateCategory(id, payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Category updated successfully",
        data: result,
    });
}));
exports.CategoryControllers = {
    createCategory,
    getCategoryTree,
    approveCategory,
    searchCategories,
    getCategorySubTree,
    updateCategory
};
