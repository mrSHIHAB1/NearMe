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
exports.HighlightServiceServices = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const highlight_service_model_1 = require("./highlight_service.model");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const createHighlight = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const highlight = yield highlight_service_model_1.HighlightService.create(payload);
    return highlight;
});
const getHighlightsByService = (serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const highlights = yield highlight_service_model_1.HighlightService.find({ service: serviceId });
    return {
        data: highlights
    };
});
const getSingleHighlight = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const highlight = yield highlight_service_model_1.HighlightService.findById(id);
    if (!highlight) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Highlight not found");
    }
    return {
        data: highlight
    };
});
const updateHighlight = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const highlight = yield highlight_service_model_1.HighlightService.findById(id);
    if (!highlight) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Highlight not found");
    }
    const updatedHighlight = yield highlight_service_model_1.HighlightService.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (payload.image && highlight.image) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(highlight.image);
    }
    return updatedHighlight;
});
const deleteHighlight = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const highlight = yield highlight_service_model_1.HighlightService.findById(id);
    if (!highlight) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Highlight not found");
    }
    yield highlight_service_model_1.HighlightService.findByIdAndDelete(id);
    return null;
});
exports.HighlightServiceServices = {
    createHighlight,
    getHighlightsByService,
    getSingleHighlight,
    updateHighlight,
    deleteHighlight
};
