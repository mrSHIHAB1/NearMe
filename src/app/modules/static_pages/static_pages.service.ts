import { AboutUs, ContactUs, HelpSupport, PrivacyPolicy, TermsCondition } from "./static_pages.model";
import { IAboutUs, IContactUs, IHelpSupport, IPrivacyPolicy, ITermsCondition } from "./static_pages.interface";

/* ---------------- ABOUT US ---------------- */
const createAboutUs = async (payload: IAboutUs) => {
  return await AboutUs.create(payload);
};

const getAboutUs = async () => {
  return await AboutUs.findOne().sort({ createdAt: -1 });
};

const updateAboutUs = async (id: string, payload: Partial<IAboutUs>) => {
  return await AboutUs.findByIdAndUpdate(id, payload, { new: true });
};


/* ---------------- CONTACT US ---------------- */
const createContactUs = async (payload: IContactUs) => {
  return await ContactUs.create(payload);
};

const getContactUs = async () => {
  return await ContactUs.findOne().sort({ createdAt: -1 });
};

const updateContactUs = async (id: string, payload: Partial<IContactUs>) => {
  return await ContactUs.findByIdAndUpdate(id, payload, { new: true });
};


/* ---------------- HELP SUPPORT ---------------- */
const createHelpSupport = async (payload: IHelpSupport) => {
  return await HelpSupport.create(payload);
};

const getHelpSupport = async () => {
  return await HelpSupport.findOne().sort({ createdAt: -1 });
};

const updateHelpSupport = async (id: string, payload: Partial<IHelpSupport>) => {
  return await HelpSupport.findByIdAndUpdate(id, payload, { new: true });
};


/* ---------------- PRIVACY POLICY ---------------- */
const createPrivacyPolicy = async (payload: IPrivacyPolicy) => {
  return await PrivacyPolicy.create(payload);
};

const getPrivacyPolicy = async () => {
  return await PrivacyPolicy.findOne().sort({ createdAt: -1 });
};

const updatePrivacyPolicy = async (id: string, payload: Partial<IPrivacyPolicy>) => {
  return await PrivacyPolicy.findByIdAndUpdate(id, payload, { new: true });
};


/* ---------------- TERMS CONDITION ---------------- */
const createTermsCondition = async (payload: ITermsCondition) => {
  return await TermsCondition.create(payload);
};

const getTermsCondition = async () => {
  return await TermsCondition.findOne().sort({ createdAt: -1 });
};

const updateTermsCondition = async (id: string, payload: Partial<ITermsCondition>) => {
  return await TermsCondition.findByIdAndUpdate(id, payload, { new: true });
};


export const StaticPageService = {
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
  updateTermsCondition,
};