import express, { Request, Response } from 'express';
import cors from 'cors';
import { router } from './app/routes';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import http from 'http';
import notFound from './app/middlewares/notFound';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import "./app/config/passport";
import expressSession from 'express-session';
import { envVars } from './app/config/env';
import { initSocket } from './app/socket';
import { paymentControllers } from './app/modules/payment/payment.controller';

const app = express();

const server = http.createServer(app);

// Stripe webhook must stay before express.json()
app.post(
  '/payment/stripe_webhook',
  express.raw({ type: 'application/json' }),
  paymentControllers.stripeWebhook
);

// Init Socket connection
initSocket(server);

app.set('trust proxy', 1);

app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// app.use('/payment/stripe_webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin: envVars.FRONTEND_URL,
    credentials: true
}))

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response)=>{
    res.status(200).json({
        message: "Welcome to the show"
    })
})

app.use(globalErrorHandler);

app.use(notFound);

export default server;