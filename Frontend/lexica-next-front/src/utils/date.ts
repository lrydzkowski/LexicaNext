import dayjs from 'dayjs';

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) {
    return 'Unknown date';
  }

  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}
