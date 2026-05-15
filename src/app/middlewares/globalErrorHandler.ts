/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError";
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handleZodError } from "../helpers/handleZodError";
import { handleValidationError } from "../helpers/handleValidationError";
import { deleteImageFromCLoudinary } from "../config/cloudinary.config";


export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {

    if (envVars.NODE_ENV === "development") {
        console.log(err);
    }

    // Clean up uploaded images on error
    try {
        const filesToDelete: string[] = [];

        // Handle single file (req.file)
        if (req.file && req.file.path) {
            filesToDelete.push(req.file.path);
        }

        // Handle multiple files (req.files) - nested object structure
        if (req.files && typeof req.files === "object") {
            const files = req.files as Record<string, Express.Multer.File[]>;
            
            Object.values(files).forEach((fileArray) => {
                if (Array.isArray(fileArray)) {
                    fileArray.forEach((file) => {
                        if (file.path) {
                            filesToDelete.push(file.path);
                        }
                    });
                }
            });
        }

        // Delete all collected images in parallel
        if (filesToDelete.length > 0) {
            await Promise.all(
                filesToDelete.map((url) => deleteImageFromCLoudinary(url).catch(() => {
                    // Silently ignore deletion errors for individual files
                }))
            );
        }
    } catch (cleanupError: any) {
        console.log("Error during image cleanup:", cleanupError.message);
    }

    let errorSources: TErrorSources[] = [];
    let statusCode = 500;
    let message = "Something went wrong!!!";

    // duplicate error
    if (err.code === 11000) {
        const simplifiedError = handleDuplicateError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Object ID error / Cast Error
    else if (err.name === "CastError") {
        const simplifiedError = handleCastError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }

    //  Zod Error
    else if (err.name === "ZodError") {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as TErrorSources[];
    }

    // Validation Error
    else if (err.name === "ValidationError") {
        const simplifiedError = handleValidationError(err);
        statusCode = simplifiedError.statusCode;
        errorSources = simplifiedError.errorSources as TErrorSources[];
        message = simplifiedError.message;
    }

    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: envVars.NODE_ENV === "development" ? err : null,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}