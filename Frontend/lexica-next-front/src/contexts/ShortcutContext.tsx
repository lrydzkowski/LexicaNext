import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { useHotkeys } from '@mantine/hooks';
import type { ShortcutScope } from '../config/shortcuts';

interface RegisteredShortcut {
  key: string;
  handler: () => void;
  scope: ShortcutScope;
}

interface ShortcutContextValue {
  activeScope: ShortcutScope;
  pushScope: (scope: ShortcutScope) => void;
  popScope: (scope: ShortcutScope) => void;
  registerShortcut: (shortcut: RegisteredShortcut) => void;
  unregisterShortcut: (key: string, scope: ShortcutScope) => void;
}

const ShortcutContext = createContext<ShortcutContextValue | null>(null);

function ShortcutHandler({
  shortcuts,
  activeScope,
}: {
  shortcuts: Map<string, RegisteredShortcut>;
  activeScope: ShortcutScope;
}) {
  const hotkeysConfig = useMemo(() => {
    const activeShortcuts = Array.from(shortcuts.values()).filter(
      (s) => s.scope === 'global' || s.scope === activeScope,
    );
    return activeShortcuts.map(
      (s) =>
        [
          s.key,
          (event: KeyboardEvent) => {
            event.preventDefault();
            s.handler();
          },
        ] as [string, (event: KeyboardEvent) => void],
    );
  }, [shortcuts, activeScope]);

  useHotkeys(hotkeysConfig, [], true);

  return null;
}

export function ShortcutProvider({ children }: { children: ReactNode }) {
  const scopeStackRef = useRef<ShortcutScope[]>(['global']);
  const [activeScope, setActiveScope] = useState<ShortcutScope>('global');
  const [shortcuts, setShortcuts] = useState<Map<string, RegisteredShortcut>>(new Map());

  const pushScope = useCallback((scope: ShortcutScope) => {
    if (scope === 'global') {
      return;
    }
    scopeStackRef.current = [...scopeStackRef.current, scope];
    setActiveScope(scope);
  }, []);

  const popScope = useCallback((scope: ShortcutScope) => {
    if (scope === 'global') {
      return;
    }
    const stack = scopeStackRef.current;
    const index = stack.lastIndexOf(scope);
    if (index !== -1) {
      scopeStackRef.current = stack.slice(0, index);
    }
    const newScope = scopeStackRef.current[scopeStackRef.current.length - 1] || 'global';
    setActiveScope(newScope);
  }, []);

  const registerShortcut = useCallback((shortcut: RegisteredShortcut) => {
    const mapKey = `${shortcut.scope}:${shortcut.key}`;
    setShortcuts((prev) => {
      const next = new Map(prev);
      next.set(mapKey, shortcut);
      return next;
    });
  }, []);

  const unregisterShortcut = useCallback((key: string, scope: ShortcutScope) => {
    const mapKey = `${scope}:${key}`;
    setShortcuts((prev) => {
      const next = new Map(prev);
      next.delete(mapKey);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      activeScope,
      pushScope,
      popScope,
      registerShortcut,
      unregisterShortcut,
    }),
    [activeScope, pushScope, popScope, registerShortcut, unregisterShortcut],
  );

  return (
    <ShortcutContext.Provider value={value}>
      <ShortcutHandler shortcuts={shortcuts} activeScope={activeScope} />
      {children}
    </ShortcutContext.Provider>
  );
}

export function useShortcutContext() {
  const context = useContext(ShortcutContext);
  if (!context) {
    throw new Error('useShortcutContext must be used within ShortcutProvider');
  }
  return context;
}
