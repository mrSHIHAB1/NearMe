/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Server } from 'socket.io';
import { User } from '../modules/user/user.model';
import { Service } from '../modules/service/service.model';

export let io: Server;
export const onlineUsers: Record<string, string> = {}; // userId -> socketId

// Socket - Init
export const initSocket = (server: any) => {
    io = new Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    io.on('connection', (socket) => {
        console.log('[SOCKET] New connection:', socket.id);

        let userId: string | null = null;

        // Event: join-user
        socket.on('join-user', (_userId: string) => {
            userId = _userId;
            socket.join(userId);
            onlineUsers[userId] = socket.id;
            
            console.log(' [SOCKET] User joined:');
            console.log('   userId:', userId);
            console.log('   socketId:', socket.id);
            console.log('    Total online users:', Object.keys(onlineUsers).length);
            console.log('    Online users:', onlineUsers);
            
            io.emit('get_online_users', Object.keys(onlineUsers));
        });

        socket.on('typing', ({ toUserId }) => {
            // Emit typing event to the room for the target userId. Using
            // rooms ensures multiple client sockets for a user will receive it.
            io.to(toUserId).emit('typing', {
                from: userId,
            });
        });
        
        // Event for updating user location
        socket.on("location-update", async (location: { lat: number; lon: number }) => {
            if (!userId) return;

            // Update the user's location in the database
            await User.findByIdAndUpdate(userId, {
                coord: { lat: location.lat, long: location.lon },
            });

            // Find the nearest services based on updated location
            const services = await Service.find({
                location: {
                    $nearSphere: {
                        $geometry: {
                            type: "Point",
                            coordinates: [location.lon, location.lat],
                        },
                        $maxDistance: 16093,  // 10 miles in meters
                    },
                },
            });

            // Emit the updated services back to the client
            io.to(userId).emit("update-nearby-services", services);
        });

        // Handle Disconnect
        socket.on('disconnect', () => {
            if (userId) {
                delete onlineUsers[userId];
                console.log(' [SOCKET] User disconnected:');
                console.log('   userId:', userId);
                console.log('    Total online users remaining:', Object.keys(onlineUsers).length);
                console.log('   Online users:', onlineUsers);
            }
            io.emit('get_online_users', Object.keys(onlineUsers));
        });
    });
};
