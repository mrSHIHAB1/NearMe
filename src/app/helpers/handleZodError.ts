import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleZodError = (err: any): TGenericErrorResponse => {
    const errorSources: TErrorSources[] = [];
    err.issues.forEach((issue: any) => {
        errorSources.push({
            // path: issue.path[issue.path.length - 1],
            // path: issue.path.join(" inside "),
            path: issue.path.length
                ? issue.path.join(".")
                : "",
            message: issue.message
        })
    })
    return {
        statusCode: 400,
        message: "Validation Error Occurs",
        errorSources
    }
}