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
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireSubscriptionsAndDowngradeUsers = void 0;
const subscription_model_1 = require("../../modules/subscription/subscription.model");
const syncUserSubscriptionInfo_1 = require("./syncUserSubscriptionInfo");
const expireSubscriptionsAndDowngradeUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const expiredSubscriptions = yield subscription_model_1.Subscription.find({
        status: "active",
        isCurrent: true,
        endDate: { $lt: now },
    });
    for (const subscription of expiredSubscriptions) {
        subscription.status = "expired";
        subscription.isCurrent = false;
        yield subscription.save();
        yield (0, syncUserSubscriptionInfo_1.syncUserSubscriptionInfo)(String(subscription.user));
    }
});
exports.expireSubscriptionsAndDowngradeUsers = expireSubscriptionsAndDowngradeUsers;
