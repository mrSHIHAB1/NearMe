"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUserSubscriptionInfo = void 0;
const user_model_1 = require("../../modules/user/user.model");
const getEffectivePlan_1 = require("./getEffectivePlan");
const syncUserSubscriptionInfo = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield (0, getEffectivePlan_1.getEffectivePlan)(userId);
    yield user_model_1.User.findByIdAndUpdate(userId, {
        $set: {
            subscriptionInfo: {
                planName: plan.name,
                badgeType: plan.features.badgeType,
                priorityScore: plan.features.priorityScore,
                isFeatured: plan.features.isHomepageFeaturedEligible,
                analyticsType: plan.features.analyticsType,
                hasHighlightedProfileBorder: plan.features.hasHighlightedProfileBorder,
            },
        },
    });
});
exports.syncUserSubscriptionInfo = syncUserSubscriptionInfo;
