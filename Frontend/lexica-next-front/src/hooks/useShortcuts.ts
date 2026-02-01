import { useEffect } from 'react';
import { SHORTCUT_KEYS, type ShortcutScope } from '../config/shortcuts';
import { useShortcutContext } from '../contexts/ShortcutContext';

export interface ShortcutHandler {
  key: string;
  handler: () => void;
}

export function useShortcuts(scope: ShortcutScope, handlers: ShortcutHandler[]): void {
  const { pushScope, popScope, registerShortcut, unregisterShortcut } = useShortcutContext();

  useEffect(() => {
    pushScope(scope);

    return () => {
      popScope(scope);
    };
  }, [scope, pushScope, popScope]);

  useEffect(() => {
    handlers.forEach((h) => {
      registerShortcut({
        key: h.key,
        scope,
        handler: h.handler,
      });
    });

    return () => {
      handlers.forEach((h) => {
        unregisterShortcut(h.key, scope);
      });
    };
  }, [handlers, scope, registerShortcut, unregisterShortcut]);
}

export function useGlobalShortcuts(handlers: ShortcutHandler[]): void {
  useShortcuts('global', handlers);
}

export function generateRowHandlers(onRowAction: (index: number) => void): ShortcutHandler[] {
  return Array.from({ length: 9 }, (_, i) => ({
    key: SHORTCUT_KEYS[`ROW_${i + 1}` as keyof typeof SHORTCUT_KEYS],
    handler: () => onRowAction(i),
  }));
}
