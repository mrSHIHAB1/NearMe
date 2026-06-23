import { JwtPayload } from 'jsonwebtoken';
import Message from './message.model';
import AppError from '../../errorHelpers/AppError';
import httpStatus from 'http-status-codes';
import { Types } from 'mongoose';
import { MessageStatus } from './message.interface';
import { onlineUsers, io } from '../../socket';
import { deleteImageFromCLoudinary } from '../../config/cloudinary.config';
import { User } from '../user/user.model';
import { sendPersonalNotification } from '../../utils/notificationSendHelper/user.notification.utils';
import { sendPushAndSave } from '../../utils/notificationSendHelper/push.notification.utils';
import { NotificationType } from '../notification/notification.interface';

// SEND DIRECT MESSAGE (1-to-1)
const sendDirectMessageService = async (
  user: JwtPayload,
  receiverId: string,
  payload: { text?: string; image?: string; replyTo?: string }
) => {
  const senderId = user.userId;

  // Check if receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    deleteImageFromCLoudinary(payload.image || '');
    throw new AppError(httpStatus.NOT_FOUND, 'Receiver not found!');
  }

  // Check if sender exists
  const sender = await User.findById(senderId);
  if (!sender) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sender not found!');
  }

  // Validate message content
  if (!payload.text && !payload.image) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Message must contain text or image!'
    );
  }

  // If replyTo is provided, verify it exists
  if (payload.replyTo) {
    const replyMessage = await Message.findById(payload.replyTo);
    if (!replyMessage) {
      throw new AppError(httpStatus.NOT_FOUND, 'Reply message not found!');
    }
  }

  // Create message
  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    message: {
      text: payload.text || '',
      image: payload.image || '',
    },
    status: MessageStatus.SENT,
    replyTo: payload.replyTo,
  });
  // Populate sender and replyTo details before emitting so clients receive
  // the populated fields (name, picture, reply info)
  await message.populate([
    { path: 'sender', select: 'name picture' },
    { path: 'replyTo', select: 'message sender' },
  ]);

  // Emit to rooms named by userId (sockets join a room with their userId)
  io.to(receiverId).emit('direct_message', message);
  io.to(senderId).emit('direct_message', message);

  const notificationPayload = {
    user: new Types.ObjectId(receiverId),
    type: NotificationType.CHAT,
    title: 'New Message',
    description: `${sender.name} sent you a message`,
    data: {
      senderId: sender?._id.toString(),
      message: message.message.text || message.message.image,
      image: sender?.picture,
    },
  };

  // Send real-time notification via socket if receiver is online
  if (onlineUsers[receiverId]) {
    await sendPersonalNotification(notificationPayload);
  } else {
    await sendPushAndSave(notificationPayload);
  }

  return message;
};

// GET DIRECT MESSAGES BETWEEN TWO USERS
const getDirectMessagesService = async (
  user: JwtPayload,
  otherUserId: string,
  query: Record<string, string>
) => {
  const userId = user.userId;

  // Check if other user exists
  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const sort = query.sort || 'createdAt'; // Default: oldest first for chat

  // Build filter conditions - only direct messages between two users
  // Messages must have sender AND receiver (no group field)
  const filterConditions = {
    $and: [
      {
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId },
        ],
      },
      { sender: { $exists: true } }, // Must have sender
      { receiver: { $exists: true } }, // Must have receiver (excludes group messages)
    ],
  };

  // Fetch messages without pagination
  const messages = await Message.find(filterConditions)
    .sort(sort)
    .populate('sender', 'name picture')
    .populate('receiver', 'name picture')
    .populate({
      path: 'replyTo',
      select: 'message sender',
      populate: { path: 'sender', select: 'name' },
    });

  // Mark messages from other user as DELIVERED if they were SENT
  await Message.updateMany(
    {
      sender: otherUserId,
      receiver: userId,
      status: MessageStatus.SENT,
    },
    { status: MessageStatus.DELIVERED }
  );

  return messages;
};

// MARK MESSAGES AS SEEN
const markMessagesAsSeenService = async (
  user: JwtPayload,
  otherUserId: string
) => {
  const userId = user.userId;

  // Check if other user exists
  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Update all messages from otherUser to current user as SEEN
  const result = await Message.updateMany(
    {
      sender: otherUserId,
      receiver: userId,
      status: { $in: [MessageStatus.SENT, MessageStatus.DELIVERED] },
    },
    { status: MessageStatus.SEEN }
  );

  // Notify sender via socket that messages have been seen. Emit to the
  // user's room so all connected devices receive the update.
  if (onlineUsers[otherUserId]) {
    io.to(otherUserId).emit('messages_seen', {
      userId: userId,
      count: result.modifiedCount,
    });
  }

  return { message: 'Messages marked as seen!', count: result.modifiedCount };
};

// GET ALL CONVERSATIONS (List of users with whom current user has chatted)
const getConversationsService = async (user: JwtPayload) => {
  const userId = user.userId;

  // Find all unique users the current user has messaged or received messages from
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: new Types.ObjectId(userId) },
          { receiver: new Types.ObjectId(userId) },
        ],
        group: { $exists: false }, // Exclude group messages
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', new Types.ObjectId(userId)] },
            '$receiver',
            '$sender',
          ],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', new Types.ObjectId(userId)] },
                  { $ne: ['$status', MessageStatus.SEEN] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        user: {
          _id: 1,
          name: 1,
          email: 1,
          picture: 1,
        },
        lastMessage: 1,
        unreadCount: 1,
      },
    },
    {
      $sort: { 'lastMessage.createdAt': -1 },
    },
  ]);

  return messages;
};

export const messageServices = {
  sendDirectMessageService,
  getDirectMessagesService,
  markMessagesAsSeenService,
  getConversationsService,
};
