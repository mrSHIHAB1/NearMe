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
exports.initSocket = exports.onlineUsers = exports.io = void 0;
/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
const socket_io_1 = require("socket.io");
const user_model_1 = require("../modules/user/user.model");
const service_model_1 = require("../modules/service/service.model");
exports.onlineUsers = {}; // userId -> socketId
// Socket - Init
const initSocket = (server) => {
    exports.io = new socket_io_1.Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
    });
    exports.io.on('connection', (socket) => {
        console.log('[SOCKET] New connection:', socket.id);
        let userId = null;
        // Event: join-user
        socket.on('join-user', (_userId) => {
            userId = _userId;
            socket.join(userId);
            exports.onlineUsers[userId] = socket.id;
            console.log(' [SOCKET] User joined:');
            console.log('   userId:', userId);
            console.log('   socketId:', socket.id);
            console.log('    Total online users:', Object.keys(exports.onlineUsers).length);
            console.log('    Online users:', exports.onlineUsers);
            exports.io.emit('get_online_users', Object.keys(exports.onlineUsers));
        });
        socket.on('typing', ({ toUserId }) => {
            // Emit typing event to the room for the target userId. Using
            // rooms ensures multiple client sockets for a user will receive it.
            exports.io.to(toUserId).emit('typing', {
                from: userId,
            });
        });
        // Event for updating user location
        socket.on("location-update", (location) => __awaiter(void 0, void 0, void 0, function* () {
            if (!userId)
                return;
            // Update the user's location in the database
            yield user_model_1.User.findByIdAndUpdate(userId, {
                coord: { lat: location.lat, long: location.lon },
            });
            // Find the nearest services based on updated location
            const services = yield service_model_1.Service.find({
                location: {
                    $nearSphere: {
                        $geometry: {
                            type: "Point",
                            coordinates: [location.lon, location.lat],
                        },
                        $maxDistance: 16093, // 10 miles in meters
                    },
                },
            });
            // Emit the updated services back to the client
            exports.io.to(userId).emit("update-nearby-services", services);
        }));
        // Handle Disconnect
        socket.on('disconnect', () => {
            if (userId) {
                delete exports.onlineUsers[userId];
                console.log(' [SOCKET] User disconnected:');
                console.log('   userId:', userId);
                console.log('    Total online users remaining:', Object.keys(exports.onlineUsers).length);
                console.log('   Online users:', exports.onlineUsers);
            }
            exports.io.emit('get_online_users', Object.keys(exports.onlineUsers));
        });
    });
};
exports.initSocket = initSocket;
