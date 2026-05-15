import { Router } from "express"
import { AuthRoutes } from "../modules/auth/auth.route"
import { UserRoutes } from "../modules/user/user.route"
import { OtpRoutes } from "../modules/otp/otp.route"
import { HighlightServiceRoutes } from "../modules/highlight_service/highlight_service.route"
import { ServiceRoutes } from "../modules/service/service.route"
import { ReviewRoutes } from "../modules/review/review.route"
import { CategoryRoutes } from "../modules/category/category.route"
import { MessageRoutes } from "../modules/message/message.route"
import { StaticPageRoutes } from "../modules/static_pages/static_pages.route"
import { PlanRoutes } from "../modules/plan/plan.route"
import { SubscriptionRoutes } from "../modules/subscription/subscription.route"
import { ServiceAnalyticsRoutes } from "../modules/serviceAnalytics/serviceAnalytics.routes"
import { PaymentRouter } from "../modules/payment/payment.route"
import { SuperAdminRoutes } from "../modules/superAdmin/superAdmin.route"


export const router = Router()

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/otp",
        route: OtpRoutes
    },
    {
        path: "/service",
        route: ServiceRoutes
    },
    {
        path: "/highlight-service",
        route: HighlightServiceRoutes
    },
    {
        path: "/review",
        route: ReviewRoutes
    },
    {
        path: "/category",
        route: CategoryRoutes
    },
    {
        path: "/message",
        route: MessageRoutes
    },
    {
        path: "/static-pages",
        route: StaticPageRoutes
    },
    {
    path: "/plans",
    route: PlanRoutes,
  },
  {
    path: "/subscriptions",
    route: SubscriptionRoutes,
  },
  {
    path: "/analytics",
    route: ServiceAnalyticsRoutes,
  },
  {
    path: "/payments",
    route: PaymentRouter,
  },
  {
    path: "/super-admin",
    route: SuperAdminRoutes,
  }

]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})
