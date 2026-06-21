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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
exports.redisClient = new ioredis_1.default({
    host: env_1.envVars.REDIS_HOST,
    port: Number(env_1.envVars.REDIS_PORT),
    username: env_1.envVars.REDIS_USERNAME,
    password: env_1.envVars.REDIS_PASSWORD,
});
exports.redisClient.on("ready", () => {
});
exports.redisClient.on("error", (err) => {
});
/**
 * Connect Redis ONCE
 */
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    if (exports.redisClient.status === "ready")
        return;
    if (exports.redisClient.status === "end") {
        yield exports.redisClient.connect();
    }
    if (exports.redisClient.status === "connecting") {
        yield new Promise((resolve) => exports.redisClient.once("ready", resolve));
    }
});
exports.connectRedis = connectRedis;
