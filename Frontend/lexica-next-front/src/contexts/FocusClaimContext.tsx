import { createContext, useContext, type ReactNode } from 'react';

const FocusClaimContext = createContext(false);

export function FocusClaimProvider({ claimed, children }: { claimed: boolean; children: ReactNode }) {
  return <FocusClaimContext.Provider value={claimed}>{children}</FocusClaimContext.Provider>;
}

export function useFocusClaim(): boolean {
  return useContext(FocusClaimContext);
}
