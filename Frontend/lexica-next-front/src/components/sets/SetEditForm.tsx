import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { notifications } from '@mantine/notifications';
import { useSet } from '../../hooks/api';
import { SetForm } from './SetForm';

export function SetEditForm() {
  const navigate = useNavigate();
  const { setId } = useParams<{ setId: string }>();
  const { data: set, isLoading: initialLoading, error } = useSet(setId!);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load set',
        color: 'red',
      });
      navigate('/sets');
    }
  }, [error, navigate]);

  return <SetForm mode="edit" setId={setId} set={set} isLoading={initialLoading} />;
}