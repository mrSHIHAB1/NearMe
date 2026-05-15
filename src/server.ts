/* eslint-disable no-console */
import { Server } from "http";
import mongoose from 'mongoose';
import app from './app';
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";
import { connectRedis } from "./app/config/redis.config";
import { seedPlans } from "./app/utils/seedPlans";

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL);
        console.log('Server is listening');

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is listening to port ${envVars.PORT}`);
        })
    } catch (error) {
        console.log(error)
    }
}

(async () => {
    await connectRedis();
    await startServer();
    await seedSuperAdmin();
    await seedPlans();
})()

process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection detected... Server is shutting down..", err);

    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }

    process.exit(1);
})

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception detected... Server is shutting down..", err);

    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }

    process.exit(1);
})

process.on("SIGTERM", () => {
    console.log("SIGTERM signal received... Server is shutting down..");

    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }

    process.exit(1);
})

// For testing unhandledRejection

// Promise.reject(new Error("I forgot to catch this error"))


//For testing uncaught Exception

// throw new Error("I forgot to handle local error");
