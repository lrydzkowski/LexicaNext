import { List, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { isValidationError } from './validation-errors';

export const showErrorNotification = (title: string, error: Error) => {
  if (isValidationError(error) && error.errors.length > 1) {
    showErrorListNotification(title, error.errors);
    return;
  }

  showErrorTextNotification(title, error.message || 'An unexpected error occurred');
};

export const showErrorTextNotification = (title: string, message: string) => {
  notifications.clean();
  notifications.show({
    title,
    message,
    color: 'red',
    position: 'top-center',
    autoClose: false,
    withBorder: true,
  });
};

export const showErrorListNotification = (title: string, errors: string[]) => {
  notifications.clean();
  notifications.show({
    title,
    message: (
      <List size="sm" spacing={4}>
        {errors.map((error, index) => (
          <List.Item key={index}>
            <Text size="sm">{error}</Text>
          </List.Item>
        ))}
      </List>
    ),
    color: 'red',
    position: 'top-center',
    autoClose: false,
    withBorder: true,
  });
};
