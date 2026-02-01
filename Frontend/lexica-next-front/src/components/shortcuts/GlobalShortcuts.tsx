import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { links } from '../../config/links';
import { SHORTCUT_KEYS } from '../../config/shortcuts';
import { useGlobalShortcuts } from '../../hooks/useShortcuts';

export function GlobalShortcuts() {
  const navigate = useNavigate();

  const handlers = useMemo(
    () => [
      {
        key: SHORTCUT_KEYS.NAVIGATE_SETS,
        handler: () => navigate(links.sets.getUrl()),
      },
      {
        key: SHORTCUT_KEYS.NAVIGATE_WORDS,
        handler: () => navigate(links.words.getUrl()),
      },
      {
        key: SHORTCUT_KEYS.NAVIGATE_ABOUT,
        handler: () => navigate(links.about.getUrl()),
      },
    ],
    [navigate],
  );

  useGlobalShortcuts(handlers);

  return null;
}
