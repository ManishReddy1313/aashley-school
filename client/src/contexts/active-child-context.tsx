import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ActiveChildContextValue = {
  activeChildId: string | null;
  setActiveChildId: (id: string | null) => void;
};

const ActiveChildContext = createContext<ActiveChildContextValue | undefined>(undefined);

export function ActiveChildProvider({ children }: { children: React.ReactNode }) {
  const [activeChildId, setActiveChildIdState] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("activeChildId");
    setActiveChildIdState(stored || null);
  }, []);

  const setActiveChildId = (id: string | null) => {
    setActiveChildIdState(id);
    if (id) {
      window.localStorage.setItem("activeChildId", id);
    } else {
      window.localStorage.removeItem("activeChildId");
    }
  };

  const value = useMemo(
    () => ({
      activeChildId,
      setActiveChildId,
    }),
    [activeChildId]
  );

  return <ActiveChildContext.Provider value={value}>{children}</ActiveChildContext.Provider>;
}

export function useActiveChild() {
  const context = useContext(ActiveChildContext);
  if (!context) {
    throw new Error("useActiveChild must be used within ActiveChildProvider");
  }
  return context;
}
