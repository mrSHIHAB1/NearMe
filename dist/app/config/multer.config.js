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
exports.multerUpload = void 0;
/* eslint-disable no-useless-escape */
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_config_1 = require("./cloudinary.config");
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_config_1.cloudinaryUpload,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        // 🔥 VALIDATION START
        // File size validation handled by multer (we'll add below)
        // Validate file type
        // if (file.fieldname === "company_logo") {
        //   const allowedLogoTypes = ["image/png", "image/jpeg", "image/jpg"];
        //   if (!allowedLogoTypes.includes(file.mimetype)) {
        //     throw new Error("Company logo must be PNG or JPEG");
        //   }
        // }
        // if (file.fieldname === "media") {
        //   const allowedMediaTypes = ["image/png", "image/jpeg", "image/jpg"];
        //   if (!allowedMediaTypes.includes(file.mimetype)) {
        //     throw new Error("Media must be image files only");
        //   }
        // }
        // 🔥 VALIDATION END
        return {
            public_id: generateFileName(file),
            // optional but recommended 👇
            folder: file.fieldname === "company_logo"
                ? "service/logo"
                : "service/media",
        };
    }),
});
const generateFileName = (file) => {
    // Remove extension from original filename first
    const nameWithoutExt = file.originalname
        .toLowerCase()
        .replace(/\.[^/.]+$/, ""); // Remove extension using regex
    const fileName = nameWithoutExt
        .replace(/\s+/g, "-")
        .replace(/\./g, "-")
        .replace(/[^a-z0-9\-]/g, "");
    const uniqueFileName = Math.random().toString(36).substring(2) +
        "-" +
        Date.now() +
        "-" +
        fileName;
    // Return without extension - let Cloudinary add it automatically
    return uniqueFileName;
};
exports.multerUpload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
});
