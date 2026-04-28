import { createContext, useContext, useEffect, useMemo, useState } from "react";

type TeacherClass = {
  id: string;
  name: string;
  section: string | null;
  academicYear: string;
};

type ActiveClassContextValue = {
  activeClassId: string | null;
  setActiveClassId: (id: string) => void;
  activeClass: TeacherClass | null;
  classes: TeacherClass[];
};

const ActiveClassContext = createContext<ActiveClassContextValue | undefined>(undefined);

export function ActiveClassProvider({ children }: { children: React.ReactNode }) {
  const [activeClassId, setActiveClassIdState] = useState<string | null>(null);
  const [classes, setClasses] = useState<TeacherClass[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/teacher/classes/me", { credentials: "include" });
        if (!res.ok) {
          setClasses([]);
          setActiveClassIdState(null);
          window.localStorage.removeItem("activeClassId");
          return;
        }
        const data = (await res.json()) as { classes: TeacherClass[] };
        const rows = data.classes ?? [];
        setClasses(rows);
        if (rows.length === 0) {
          setActiveClassIdState(null);
          window.localStorage.removeItem("activeClassId");
          return;
        }
        if (rows.length === 1) {
          setActiveClassIdState(rows[0].id);
          window.localStorage.setItem("activeClassId", rows[0].id);
          return;
        }
        const stored = window.localStorage.getItem("activeClassId");
        const fallback = rows[0].id;
        const selected = stored && rows.some((row) => row.id === stored) ? stored : fallback;
        setActiveClassIdState(selected);
        window.localStorage.setItem("activeClassId", selected);
      } catch {
        setClasses([]);
        setActiveClassIdState(null);
      }
    };
    load();
  }, []);

  const setActiveClassId = (id: string) => {
    setActiveClassIdState(id);
    window.localStorage.setItem("activeClassId", id);
  };

  const activeClass = useMemo(
    () => classes.find((row) => row.id === activeClassId) ?? null,
    [classes, activeClassId],
  );

  const value = useMemo(
    () => ({ activeClassId, setActiveClassId, activeClass, classes }),
    [activeClassId, activeClass, classes],
  );

  return <ActiveClassContext.Provider value={value}>{children}</ActiveClassContext.Provider>;
}

export function useActiveClass() {
  const context = useContext(ActiveClassContext);
  if (!context) {
    throw new Error("useActiveClass must be used within ActiveClassProvider");
  }
  return context;
}
