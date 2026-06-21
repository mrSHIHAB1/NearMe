"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodError = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const handleZodError = (err) => {
    const errorSources = [];
    err.issues.forEach((issue) => {
        errorSources.push({
            // path: issue.path[issue.path.length - 1],
            // path: issue.path.join(" inside "),
            path: issue.path.length
                ? issue.path.join(".")
                : "",
            message: issue.message
        });
    });
    return {
        statusCode: 400,
        message: "Validation Error Occurs",
        errorSources
    };
};
exports.handleZodError = handleZodError;
