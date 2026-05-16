import { notifications } from '@mantine/notifications';

export const showSuccessNotification = (title: string, message: string) => {
  notifications.clean();
  notifications.show({
    title,
    message,
    color: 'green',
    position: 'top-center',
    autoClose: 4000,
    withBorder: true,
  });
};
