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
exports.sendGlobalNotification = void 0;
const notification_model_1 = require("../../modules/notification/notification.model");
const socket_1 = require("../../socket");
const sendGlobalNotification = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_model_1.Notification.create(payload);
    socket_1.io.emit('notification', notification);
});
exports.sendGlobalNotification = sendGlobalNotification;
