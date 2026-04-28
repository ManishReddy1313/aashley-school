import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Search,
  School,
  UserPlus,
  Users,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { SchoolLogo } from "@/components/school-logo";
import { useAuth } from "@/hooks/use-auth";
import { useActiveChild } from "@/contexts/active-child-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PortalLayoutProps = {
  children: React.ReactNode;
};

type SearchResult = {
  type: "student" | "lead" | "announcement";
  id: string;
  label: string;
  sublabel: string;
  href: string;
};

type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  isRead: boolean;
  relatedHref: string | null;
  createdAt: string | null;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: boolean;
  badgeCount?: number;
};

function getUserInitials(user: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}) {
  const first = user.firstName?.trim()?.[0];
  const last = user.lastName?.trim()?.[0];
  if (first || last) {
    return `${first ?? ""}${last ?? ""}`.toUpperCase();
  }
  return (user.username?.trim()?.[0] ?? "U").toUpperCase();
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [location, setLocation] = useLocation();
  const { user, roleLabel, can, isLoading, isAuthenticated, logout } = useAuth();
  const { activeChildId, setActiveChildId } = useActiveChild();

  const childrenQuery = useQuery<any[]>({
    queryKey: ["/api/parent/children"],
    enabled: isAuthenticated,
  });
  const unreadCountQuery = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    enabled: isAuthenticated && (can("chat.initiate") || can("chat.respond")),
    refetchInterval: 60000,
  });
  const unreadNotificationCountQuery = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
  const notificationsQuery = useQuery<NotificationRow[]>({
    queryKey: ["/api/notifications"],
    enabled: false,
  });
  const searchQuery = useQuery<{ results: SearchResult[]; query: string }>({
    queryKey: ["/api/search", debouncedSearch],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: isAuthenticated && debouncedSearch.length >= 2,
  });

  const notificationsUnreadCount = unreadNotificationCountQuery.data?.count ?? 0;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/portal");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCmdK) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (!notificationsOpen) return;
    notificationsQuery.refetch();
  }, [notificationsOpen]);

  const groupedResults = useMemo(() => {
    const rows = searchQuery.data?.results ?? [];
    return {
      students: rows.filter((row) => row.type === "student"),
      admissions: rows.filter((row) => row.type === "lead"),
      announcements: rows.filter((row) => row.type === "announcement"),
    };
  }, [searchQuery.data?.results]);

  const flatResults = useMemo(() => searchQuery.data?.results ?? [], [searchQuery.data?.results]);

  useEffect(() => {
    setSelectedResultIndex(0);
  }, [debouncedSearch, searchQuery.data?.results?.length]);

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard, visible: true },
      { label: "Admissions CRM", href: "/portal/admissions", icon: UserPlus, visible: can("admissions.view") },
      { label: "Announcements", href: "/portal/announcements", icon: Megaphone, visible: can("portal.read") },
      { label: "Marks & Exams", href: "/portal/marks", icon: BookOpen, visible: can("marks.view") },
      { label: "Timetable", href: "/portal/timetable", icon: CalendarDays, visible: can("timetable.view") },
      {
        label: "Messages",
        href: "/portal/messages",
        icon: MessageSquare,
        visible: can("chat.initiate") || can("chat.respond"),
        badgeCount: unreadCountQuery.data?.count ?? 0,
      },
      { label: "Students", href: "/portal/students", icon: GraduationCap, visible: can("students.read") },
      { label: "Manage Classes", href: "/portal/manage-classes", icon: School, visible: can("classes.manage") },
      { label: "Manage Users", href: "/portal/manage-users", icon: Users, visible: can("users.manage") },
    ].filter((item) => item.visible),
    [can, unreadCountQuery.data?.count]
  );

  const isActive = (href: string) => {
    if (href === "/portal/dashboard") return location === "/portal/dashboard";
    return location.startsWith(href);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!flatResults.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedResultIndex((prev) => (prev + 1) % flatResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedResultIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = flatResults[selectedResultIndex];
      if (!target) return;
      setSearchOpen(false);
      setSearchInput("");
      setDebouncedSearch("");
      setLocation(target.href);
    }
  };

  const markAllNotificationsRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST", credentials: "include" });
    await Promise.all([
      unreadNotificationCountQuery.refetch(),
      notificationsQuery.refetch(),
    ]);
  };

  const SidebarContent = (
    <div className="h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      <div className="px-4 pt-4 pb-4 mb-2 border-b border-sidebar-border">
        <div className="flex items-start justify-between gap-2">
          <div>
            <SchoolLogo variant="white" className="mb-3" />
            <h2 className="font-serif text-base text-sidebar-foreground">Aashley International</h2>
            <p className="text-xs text-sidebar-foreground/60">School Portal</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                  <Bell className="h-4 w-4" />
                  {notificationsUnreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
                      {notificationsUnreadCount}
                    </span>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 rounded-none">
                <div className="border-b border-border px-3 py-2">
                  <p className="text-sm font-medium text-foreground">Notifications</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notificationsQuery.isFetching ? (
                    <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                  ) : (notificationsQuery.data ?? []).length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">No notifications yet</div>
                  ) : (
                    (notificationsQuery.data ?? []).slice(0, 10).map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        className={`w-full text-left border-b border-border px-3 py-2 ${
                          note.isRead ? "bg-card" : "bg-primary/5 border-l-2 border-l-primary"
                        }`}
                        onClick={() => {
                          if (!note.relatedHref) return;
                          setNotificationsOpen(false);
                          setLocation(note.relatedHref);
                        }}
                      >
                        <p className="text-sm font-medium text-foreground">{note.title}</p>
                        {note.body ? (
                          <p className="text-xs text-muted-foreground truncate">{note.body}</p>
                        ) : null}
                        <p className="text-xs text-muted-foreground/60">
                          {note.createdAt
                            ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })
                            : "just now"}
                        </p>
                      </button>
                    ))
                  )}
                </div>
                <div className="border-t border-border p-2">
                  <Button variant="outline" className="w-full rounded-none" onClick={markAllNotificationsRead}>
                    Mark all as read
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="h-10 w-10 bg-sidebar-accent text-sidebar-accent-foreground grid place-items-center text-sm font-semibold">
          {getUserInitials(user)}
        </div>
        <p className="mt-2 text-sm font-semibold text-sidebar-foreground">
          {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username}
        </p>
        <p className="text-xs text-sidebar-foreground/60">{roleLabel || "User"}</p>
      </div>

      {user.role === "student" && (childrenQuery.data?.length ?? 0) > 1 ? (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 mb-1">Viewing as:</p>
          <Select value={activeChildId || childrenQuery.data?.[0]?.studentUser?.id} onValueChange={setActiveChildId}>
            <SelectTrigger className="rounded-none bg-sidebar-accent text-sidebar-foreground border-sidebar-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(childrenQuery.data ?? []).map((row) => (
                <SelectItem key={row.studentUser.id} value={row.studentUser.id}>
                  {`${row.studentUser.firstName ?? ""} ${row.studentUser.lastName ?? ""}`.trim() ||
                    row.studentUser.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <a
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-4 py-2.5 text-sm font-medium border-l-2 transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-primary"
                    : "border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className="ml-2 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
                    {item.badgeCount}
                  </span>
                ) : null}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <button
          type="button"
          className="w-full flex items-center px-2 py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lg:hidden h-14 bg-background border-b border-border px-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="font-serif text-sm">Aashley International</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {notificationsUnreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
                    {notificationsUnreadCount}
                  </span>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 rounded-none">
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-medium text-foreground">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notificationsQuery.isFetching ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                ) : (notificationsQuery.data ?? []).length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No notifications yet</div>
                ) : (
                  (notificationsQuery.data ?? []).slice(0, 10).map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      className={`w-full text-left border-b border-border px-3 py-2 ${
                        note.isRead ? "bg-card" : "bg-primary/5 border-l-2 border-l-primary"
                      }`}
                      onClick={() => {
                        if (!note.relatedHref) return;
                        setNotificationsOpen(false);
                        setLocation(note.relatedHref);
                      }}
                    >
                      <p className="text-sm font-medium text-foreground">{note.title}</p>
                      {note.body ? <p className="text-xs text-muted-foreground truncate">{note.body}</p> : null}
                      <p className="text-xs text-muted-foreground/60">
                        {note.createdAt
                          ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })
                          : "just now"}
                      </p>
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-border p-2">
                <Button variant="outline" className="w-full rounded-none" onClick={markAllNotificationsRead}>
                  Mark all as read
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <ThemeToggle />
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r border-sidebar-border">
          {SidebarContent}
        </SheetContent>
      </Sheet>

      <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
        <div className="hidden lg:flex">{SidebarContent}</div>
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl rounded-none">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>Search students, leads, announcements.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            className="rounded-none"
            placeholder="Search students, leads, announcements..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={onSearchKeyDown}
          />
          <div className="max-h-[26rem] overflow-y-auto border border-border">
            {debouncedSearch.length < 2 ? (
              <div className="p-4 text-sm text-muted-foreground">Type at least 2 characters to search</div>
            ) : searchQuery.isFetching ? (
              <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            ) : flatResults.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">{`No results for '${debouncedSearch}'`}</div>
            ) : (
              <div>
                {([
                  { title: "Students", key: "students" as const },
                  { title: "Admissions", key: "admissions" as const },
                  { title: "Announcements", key: "announcements" as const },
                ]).map((section) => {
                  const rows = groupedResults[section.key];
                  if (!rows.length) return null;
                  return (
                    <div key={section.key}>
                      <div className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground bg-secondary border-b border-border">
                        {section.title}
                      </div>
                      {rows.map((row) => {
                        const flatIndex = flatResults.findIndex((item) => item.id === row.id && item.type === row.type);
                        return (
                          <button
                            key={`${row.type}-${row.id}`}
                            type="button"
                            className={`w-full px-3 py-2 border-b border-border text-left ${
                              flatIndex === selectedResultIndex ? "bg-primary/5" : "bg-card"
                            }`}
                            onMouseEnter={() => setSelectedResultIndex(flatIndex)}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchInput("");
                              setDebouncedSearch("");
                              setLocation(row.href);
                            }}
                          >
                            <p className="text-sm font-medium text-foreground">{row.label}</p>
                            <p className="text-xs text-muted-foreground">{row.sublabel}</p>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
