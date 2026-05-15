/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { HighlightServiceServices } from "./highlight_service.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IHighlightService } from "./highlight_service.interface";
import { Service } from "../service/service.model";

const createHighlight = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload: IHighlightService = {
        ...req.body,
        image: req.file?.path
    }

    const highlight = await HighlightServiceServices.createHighlight(payload);

    // Update the corresponding service to include the new highlight
    const serviceId = req.body.service;  // Assuming service ID is passed in the payload
    await Service.findByIdAndUpdate(serviceId, {
        $push: { highlight_services: highlight._id }
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Highlight created successfully and added to service",
        data: highlight,
    });
});

const getHighlightsByService = catchAsync(async (req: Request, res: Response) => {

    const serviceId = req.params.serviceId as string;

    const result = await HighlightServiceServices.getHighlightsByService(serviceId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Highlights retrieved successfully",
        data: result.data
    })
});

const getSingleHighlight = catchAsync(async (req: Request, res: Response) => {

    const id = req.params.id as string;

    const result = await HighlightServiceServices.getSingleHighlight(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Highlight retrieved successfully",
        data: result.data
    })
});

const updateHighlight = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params.id as string;

    const payload: IHighlightService = {
        ...req.body,
        image: req.file?.path
    }


    const result = await HighlightServiceServices.updateHighlight(id, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Highlight updated successfully",
        data: result
    })
});

const deleteHighlight = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params.id as string;

    await HighlightServiceServices.deleteHighlight(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Highlight deleted successfully",
        data: null
    })
});

export const HighlightServiceControllers = {
    createHighlight,
    getHighlightsByService,
    getSingleHighlight,
    updateHighlight,
    deleteHighlight
};