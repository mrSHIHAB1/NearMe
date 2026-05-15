import { model, Schema } from "mongoose";
import { IAboutUs, IContactUs, IHelpSupport, IPrivacyPolicy, ITermsCondition } from "./static_pages.interface";

const aboutUsSchema = new Schema<IAboutUs>({
     name: {
        type: String
    }
}, {timestamps: true})

export const AboutUs = model<IAboutUs>("AboutUs", aboutUsSchema)

const contactUsSchema = new Schema<IContactUs>({
     email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
}, {timestamps: true})

export const ContactUs = model<IContactUs>("ContactUs", contactUsSchema)


const helpSupportSchema = new Schema<IHelpSupport>({
     name: {
        type: String
    }
}, {timestamps: true})

export const HelpSupport = model<IHelpSupport>("HelpSupport", helpSupportSchema)


const privacyPolicySchema = new Schema<IPrivacyPolicy>({
     name: {
        type: String
    }
}, {timestamps: true})

export const PrivacyPolicy = model<IPrivacyPolicy>("PrivacyPolicy", privacyPolicySchema)


const termsConditionSchema = new Schema<ITermsCondition>({
     name: {
        type: String
    }
}, {timestamps: true})

export const TermsCondition = model<ITermsCondition>("TermsCondition", termsConditionSchema)