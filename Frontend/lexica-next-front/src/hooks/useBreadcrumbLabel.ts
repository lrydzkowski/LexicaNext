import { useSet, useWord } from './api';

const truncateId = (id: string): string => {
  if (id.length <= 8) {
    return id;
  }

  return `${id.substring(0, 8)}...`;
};

export function useSetLabel(id: string): { label: string; isLoading: boolean } {
  const { data, isLoading } = useSet(id);

  if (isLoading) {
    return { label: truncateId(id), isLoading: true };
  }

  return { label: data?.name ?? truncateId(id), isLoading: false };
}

export function useWordLabel(id: string): { label: string; isLoading: boolean } {
  const { data, isLoading } = useWord(id);

  if (isLoading) {
    return { label: truncateId(id), isLoading: true };
  }

  return { label: data?.word ?? truncateId(id), isLoading: false };
}
