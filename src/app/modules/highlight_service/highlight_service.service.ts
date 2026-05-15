import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { HighlightService } from "./highlight_service.model";
import { IHighlightService } from "./highlight_service.interface";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";

const createHighlight = async (payload: Partial<IHighlightService>) => {

    const highlight = await HighlightService.create(payload);

    return highlight;
};

const getHighlightsByService = async (serviceId: string) => {

    const highlights = await HighlightService.find({ service: serviceId });

    return {
        data: highlights
    };
};

const getSingleHighlight = async (id: string) => {

    const highlight = await HighlightService.findById(id);

    if (!highlight) {
        throw new AppError(httpStatus.NOT_FOUND, "Highlight not found");
    }

    return {
        data: highlight
    };
};

const updateHighlight = async (id: string, payload: Partial<IHighlightService>) => {

    const highlight = await HighlightService.findById(id);

    if (!highlight) {
        throw new AppError(httpStatus.NOT_FOUND, "Highlight not found");
    }

    const updatedHighlight = await HighlightService.findByIdAndUpdate(
        id,
        payload,
        { new: true, runValidators: true }
    );

    if (payload.image && highlight.image) {
        await deleteImageFromCLoudinary(highlight.image)
    }

    return updatedHighlight;
};

const deleteHighlight = async (id: string) => {

    const highlight = await HighlightService.findById(id);

    if (!highlight) {
        throw new AppError(httpStatus.NOT_FOUND, "Highlight not found");
    }

    await HighlightService.findByIdAndDelete(id);

    return null;
};

export const HighlightServiceServices = {
    createHighlight,
    getHighlightsByService,
    getSingleHighlight,
    updateHighlight,
    deleteHighlight
};