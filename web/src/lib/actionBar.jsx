import React, { createContext, useContext, useMemo, useState } from "react";

const ActionBarContext = createContext(null);

export function ActionBarProvider({ children }) {
  const [homeAction, setHomeAction] = useState(null); // { label, onClick, disabled? }

  const value = useMemo(() => ({ homeAction, setHomeAction }), [homeAction]);
  return <ActionBarContext.Provider value={value}>{children}</ActionBarContext.Provider>;
}

export function useActionBar() {
  const ctx = useContext(ActionBarContext);
  if (!ctx) throw new Error("useActionBar must be used inside ActionBarProvider");
  return ctx;
}