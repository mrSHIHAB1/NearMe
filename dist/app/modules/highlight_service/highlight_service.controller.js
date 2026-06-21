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
exports.HighlightServiceControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const highlight_service_service_1 = require("./highlight_service.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const service_model_1 = require("../service/service.model");
const createHighlight = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payload = Object.assign(Object.assign({}, req.body), { image: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const highlight = yield highlight_service_service_1.HighlightServiceServices.createHighlight(payload);
    // Update the corresponding service to include the new highlight
    const serviceId = req.body.service; // Assuming service ID is passed in the payload
    yield service_model_1.Service.findByIdAndUpdate(serviceId, {
        $push: { highlight_services: highlight._id }
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Highlight created successfully and added to service",
        data: highlight,
    });
}));
const getHighlightsByService = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = req.params.serviceId;
    const result = yield highlight_service_service_1.HighlightServiceServices.getHighlightsByService(serviceId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Highlights retrieved successfully",
        data: result.data
    });
}));
const getSingleHighlight = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield highlight_service_service_1.HighlightServiceServices.getSingleHighlight(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Highlight retrieved successfully",
        data: result.data
    });
}));
const updateHighlight = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    const payload = Object.assign(Object.assign({}, req.body), { image: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const result = yield highlight_service_service_1.HighlightServiceServices.updateHighlight(id, payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Highlight updated successfully",
        data: result
    });
}));
const deleteHighlight = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    yield highlight_service_service_1.HighlightServiceServices.deleteHighlight(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Highlight deleted successfully",
        data: null
    });
}));
exports.HighlightServiceControllers = {
    createHighlight,
    getHighlightsByService,
    getSingleHighlight,
    updateHighlight,
    deleteHighlight
};
