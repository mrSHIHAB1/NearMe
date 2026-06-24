"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_route_1 = require("../modules/auth/auth.route");
const user_route_1 = require("../modules/user/user.route");
const otp_route_1 = require("../modules/otp/otp.route");
const highlight_service_route_1 = require("../modules/highlight_service/highlight_service.route");
const service_route_1 = require("../modules/service/service.route");
const review_route_1 = require("../modules/review/review.route");
const category_route_1 = require("../modules/category/category.route");
const message_route_1 = require("../modules/message/message.route");
const static_pages_route_1 = require("../modules/static_pages/static_pages.route");
const plan_route_1 = require("../modules/plan/plan.route");
const subscription_route_1 = require("../modules/subscription/subscription.route");
const serviceAnalytics_routes_1 = require("../modules/serviceAnalytics/serviceAnalytics.routes");
const payment_route_1 = require("../modules/payment/payment.route");
const superAdmin_route_1 = require("../modules/superAdmin/superAdmin.route");
const notification_route_1 = require("../modules/notification/notification.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_route_1.UserRoutes
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes
    },
    {
        path: "/otp",
        route: otp_route_1.OtpRoutes
    },
    {
        path: "/service",
        route: service_route_1.ServiceRoutes
    },
    {
        path: "/highlight-service",
        route: highlight_service_route_1.HighlightServiceRoutes
    },
    {
        path: "/review",
        route: review_route_1.ReviewRoutes
    },
    {
        path: "/category",
        route: category_route_1.CategoryRoutes
    },
    {
        path: "/message",
        route: message_route_1.MessageRoutes
    },
    {
        path: "/static-pages",
        route: static_pages_route_1.StaticPageRoutes
    },
    {
        path: "/plans",
        route: plan_route_1.PlanRoutes,
    },
    {
        path: "/subscriptions",
        route: subscription_route_1.SubscriptionRoutes,
    },
    {
        path: "/analytics",
        route: serviceAnalytics_routes_1.ServiceAnalyticsRoutes,
    },
    {
        path: "/payments",
        route: payment_route_1.PaymentRoutes,
    },
    {
        path: "/super-admin",
        route: superAdmin_route_1.SuperAdminRoutes,
    },
    {
        path: "/notification",
        route: notification_route_1.notificationRouter,
    }
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
