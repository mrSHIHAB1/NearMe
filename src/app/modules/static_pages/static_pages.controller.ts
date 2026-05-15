import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StaticPageService } from "./static_pages.service";

/* ---------------- ABOUT US ---------------- */
const createAboutUs = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.createAboutUs(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "About Us created successfully!",
    data: result,
  });
});

const getAboutUs = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.getAboutUs();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "About Us retrieved successfully!",
    data: result,
  });
});

const updateAboutUs = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.updateAboutUs(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "About Us updated successfully!",
    data: result,
  });
});


/* ---------------- CONTACT US ---------------- */
const createContactUs = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.createContactUs(req.body);
  // console.log("i am from controller", req.body)

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Contact Us created successfully!",
    data: result,
  });
});

const getContactUs = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.getContactUs();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact Us retrieved successfully!",
    data: result,
  });
});

const updateContactUs = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.updateContactUs(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact Us updated successfully!",
    data: result,
  });
});

/* ---------------- HELP SUPPORT ---------------- */
const createHelpSupport = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.createAboutUs(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "About Us created successfully!",
    data: result,
  });
});

const getHelpSupport = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.getAboutUs();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "About Us retrieved successfully!",
    data: result,
  });
});

const updateHelpSupport = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.updateAboutUs(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "About Us updated successfully!",
    data: result,
  });
});

/* ---------------- PRIVACY POLICY ---------------- */
const createPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.createAboutUs(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "About Us created successfully!",
    data: result,
  });
});

const getPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.getAboutUs();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "About Us retrieved successfully!",
    data: result,
  });
});

const updatePrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.updateAboutUs(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "About Us updated successfully!",
    data: result,
  });
});

/* ---------------- TERMS CONDITION ---------------- */
const createTermsCondition = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.createAboutUs(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "About Us created successfully!",
    data: result,
  });
});

const getTermsCondition = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.getAboutUs();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "About Us retrieved successfully!",
    data: result,
  });
});

const updateTermsCondition = catchAsync(async (req: Request, res: Response) => {
  const result = await StaticPageService.updateAboutUs(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "About Us updated successfully!",
    data: result,
  });
});


/* ---------------- EXPORT ---------------- */
export const StaticPageController = {
  createAboutUs,
  getAboutUs,
  updateAboutUs,

  createContactUs,
  getContactUs,
  updateContactUs,

  createHelpSupport,
  getHelpSupport,
  updateHelpSupport,

  createPrivacyPolicy,
  getPrivacyPolicy,
  updatePrivacyPolicy,

  createTermsCondition,
  getTermsCondition,
  updateTermsCondition
};