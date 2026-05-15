
import { INotification } from '../../modules/notification/notification.interface';
import { Notification } from '../../modules/notification/notification.model';
import { io } from '../../socket';

export const sendGlobalNotification = async (payload: INotification) => {
  const notification = await Notification.create(payload);

  io.emit('notification', notification);
};
