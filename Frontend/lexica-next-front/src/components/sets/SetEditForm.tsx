import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { links } from '@/config/links';
import { showErrorNotification } from '@/services/error-notifications';
import { useSet } from '../../hooks/api';
import { SetForm } from './SetForm';

export function SetEditForm() {
  const navigate = useNavigate();
  const { setId } = useParams<{ setId: string }>();
  const { data: set, isLoading: initialLoading, error } = useSet(setId!);

  useEffect(() => {
    if (error) {
      showErrorNotification('Error Loading Set', error);
      navigate(links.sets.getUrl());
    }
  }, [error, navigate]);

  return <SetForm mode="edit" setId={setId} set={set} isLoading={initialLoading} />;
}
