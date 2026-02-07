export type ShortcutScope = 'global' | 'sets-list' | 'words-list' | 'word-form' | 'set-form' | 'select-words';

export interface ShortcutDefinition {
  key: string;
  description: string;
  scope: ShortcutScope;
}

export const SHORTCUT_KEYS = {
  NAVIGATE_SETS: 'mod+1',
  NAVIGATE_WORDS: 'mod+2',
  NAVIGATE_ABOUT: 'mod+3',
  CREATE_NEW: 'alt+n',
  FOCUS_SEARCH: 'alt+f',
  SAVE: 'alt+s',
  CANCEL: 'alt+c',
  ADD_WORDS: 'alt+a',
  CREATE_NEW_WORD: 'alt+n',
  GENERATE: 'alt+g',
  OPEN_CAMBRIDGE: 'alt+d',
  OPEN_LING: 'alt+l',
  ROW_1: 'alt+1',
  ROW_2: 'alt+2',
  ROW_3: 'alt+3',
  ROW_4: 'alt+4',
  ROW_5: 'alt+5',
  ROW_6: 'alt+6',
  ROW_7: 'alt+7',
  ROW_8: 'alt+8',
  ROW_9: 'alt+9',
  DISMISS_NOTIFICATIONS: 'Escape',
} as const;

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  { key: SHORTCUT_KEYS.NAVIGATE_SETS, description: 'Go to Sets page', scope: 'global' },
  { key: SHORTCUT_KEYS.NAVIGATE_WORDS, description: 'Go to Words page', scope: 'global' },
  { key: SHORTCUT_KEYS.NAVIGATE_ABOUT, description: 'Go to About page', scope: 'global' },
  { key: SHORTCUT_KEYS.DISMISS_NOTIFICATIONS, description: 'Dismiss notifications', scope: 'global' },
  { key: SHORTCUT_KEYS.CREATE_NEW, description: 'Create new item', scope: 'sets-list' },
  { key: SHORTCUT_KEYS.FOCUS_SEARCH, description: 'Focus search', scope: 'sets-list' },
  { key: SHORTCUT_KEYS.ROW_1, description: 'Focus row 1', scope: 'sets-list' },
  { key: SHORTCUT_KEYS.ROW_2, description: 'Focus row 2', scope: 'sets-list' },
  { key: SHORTCUT_KEYS.ROW_3, description: 'Focus row 3', scope: 'sets-list' },
  { key: SHORTCUT_KEYS.ROW_4, description: 'Focus row 4', scope: 'sets-list' },
  { key: SHORTCUT_KEYS.ROW_5, description: 'Focus row 5', scope: 'sets-list' },
  { key: SHORTCUT_KEYS.ROW_6, description: 'Focus row 6', scope: 'sets-list' },
  { key: SHORTCUT_KEYS.ROW_7, description: 'Focus row 7', scope: 'sets-list' },
  { key: SHORTCUT_KEYS.ROW_8, description: 'Focus row 8', scope: 'sets-list' },
  { key: SHORTCUT_KEYS.ROW_9, description: 'Focus row 9', scope: 'sets-list' },
  { key: SHORTCUT_KEYS.CREATE_NEW, description: 'Create new item', scope: 'words-list' },
  { key: SHORTCUT_KEYS.FOCUS_SEARCH, description: 'Focus search', scope: 'words-list' },
  { key: SHORTCUT_KEYS.ROW_1, description: 'Focus row 1', scope: 'words-list' },
  { key: SHORTCUT_KEYS.ROW_2, description: 'Focus row 2', scope: 'words-list' },
  { key: SHORTCUT_KEYS.ROW_3, description: 'Focus row 3', scope: 'words-list' },
  { key: SHORTCUT_KEYS.ROW_4, description: 'Focus row 4', scope: 'words-list' },
  { key: SHORTCUT_KEYS.ROW_5, description: 'Focus row 5', scope: 'words-list' },
  { key: SHORTCUT_KEYS.ROW_6, description: 'Focus row 6', scope: 'words-list' },
  { key: SHORTCUT_KEYS.ROW_7, description: 'Focus row 7', scope: 'words-list' },
  { key: SHORTCUT_KEYS.ROW_8, description: 'Focus row 8', scope: 'words-list' },
  { key: SHORTCUT_KEYS.ROW_9, description: 'Focus row 9', scope: 'words-list' },
  { key: SHORTCUT_KEYS.SAVE, description: 'Save', scope: 'word-form' },
  { key: SHORTCUT_KEYS.CANCEL, description: 'Cancel', scope: 'word-form' },
  { key: SHORTCUT_KEYS.GENERATE, description: 'Generate translations & sentences', scope: 'word-form' },
  { key: SHORTCUT_KEYS.OPEN_CAMBRIDGE, description: 'Open Cambridge Dictionary', scope: 'word-form' },
  { key: SHORTCUT_KEYS.OPEN_LING, description: 'Open Ling.pl', scope: 'word-form' },
  { key: SHORTCUT_KEYS.ROW_1, description: 'Remove item 1', scope: 'word-form' },
  { key: SHORTCUT_KEYS.ROW_2, description: 'Remove item 2', scope: 'word-form' },
  { key: SHORTCUT_KEYS.ROW_3, description: 'Remove item 3', scope: 'word-form' },
  { key: SHORTCUT_KEYS.ROW_4, description: 'Remove item 4', scope: 'word-form' },
  { key: SHORTCUT_KEYS.ROW_5, description: 'Remove item 5', scope: 'word-form' },
  { key: SHORTCUT_KEYS.ROW_6, description: 'Remove item 6', scope: 'word-form' },
  { key: SHORTCUT_KEYS.ROW_7, description: 'Remove item 7', scope: 'word-form' },
  { key: SHORTCUT_KEYS.ROW_8, description: 'Remove item 8', scope: 'word-form' },
  { key: SHORTCUT_KEYS.ROW_9, description: 'Remove item 9', scope: 'word-form' },
  { key: SHORTCUT_KEYS.SAVE, description: 'Save', scope: 'set-form' },
  { key: SHORTCUT_KEYS.CANCEL, description: 'Cancel', scope: 'set-form' },
  { key: SHORTCUT_KEYS.ADD_WORDS, description: 'Add words', scope: 'set-form' },
  { key: SHORTCUT_KEYS.CREATE_NEW_WORD, description: 'Create new word', scope: 'set-form' },
  { key: SHORTCUT_KEYS.ROW_1, description: 'Focus delete row 1 (Enter to remove)', scope: 'set-form' },
  { key: SHORTCUT_KEYS.ROW_2, description: 'Focus delete row 2 (Enter to remove)', scope: 'set-form' },
  { key: SHORTCUT_KEYS.ROW_3, description: 'Focus delete row 3 (Enter to remove)', scope: 'set-form' },
  { key: SHORTCUT_KEYS.ROW_4, description: 'Focus delete row 4 (Enter to remove)', scope: 'set-form' },
  { key: SHORTCUT_KEYS.ROW_5, description: 'Focus delete row 5 (Enter to remove)', scope: 'set-form' },
  { key: SHORTCUT_KEYS.ROW_6, description: 'Focus delete row 6 (Enter to remove)', scope: 'set-form' },
  { key: SHORTCUT_KEYS.ROW_7, description: 'Focus delete row 7 (Enter to remove)', scope: 'set-form' },
  { key: SHORTCUT_KEYS.ROW_8, description: 'Focus delete row 8 (Enter to remove)', scope: 'set-form' },
  { key: SHORTCUT_KEYS.ROW_9, description: 'Focus delete row 9 (Enter to remove)', scope: 'set-form' },
  { key: SHORTCUT_KEYS.FOCUS_SEARCH, description: 'Focus search', scope: 'select-words' },
  { key: SHORTCUT_KEYS.CANCEL, description: 'Close', scope: 'select-words' },
  { key: SHORTCUT_KEYS.SAVE, description: 'Done', scope: 'select-words' },
  { key: SHORTCUT_KEYS.ROW_1, description: 'Select row 1', scope: 'select-words' },
  { key: SHORTCUT_KEYS.ROW_2, description: 'Select row 2', scope: 'select-words' },
  { key: SHORTCUT_KEYS.ROW_3, description: 'Select row 3', scope: 'select-words' },
  { key: SHORTCUT_KEYS.ROW_4, description: 'Select row 4', scope: 'select-words' },
  { key: SHORTCUT_KEYS.ROW_5, description: 'Select row 5', scope: 'select-words' },
  { key: SHORTCUT_KEYS.ROW_6, description: 'Select row 6', scope: 'select-words' },
  { key: SHORTCUT_KEYS.ROW_7, description: 'Select row 7', scope: 'select-words' },
  { key: SHORTCUT_KEYS.ROW_8, description: 'Select row 8', scope: 'select-words' },
  { key: SHORTCUT_KEYS.ROW_9, description: 'Select row 9', scope: 'select-words' },
];

export function formatShortcutKey(key: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  return key
    .replace('mod', isMac ? '⌘' : 'Ctrl')
    .replace('alt', isMac ? '⌥' : 'Alt')
    .replace('shift', isMac ? '⇧' : 'Shift')
    .replace(/\+/g, ' + ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getShortcutsByScope(scope: ShortcutScope): ShortcutDefinition[] {
  return SHORTCUT_DEFINITIONS.filter((s) => s.scope === scope);
}
