import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  DAYS,
  DEFAULT_PERIOD_TIMES,
  PERIODS,
  getCurrentPeriod,
  getTodayDayNumber,
  subjectColor,
} from "@/lib/timetable-utils";

type TimetableSlot = {
  id: string;
  classId: string;
  academicYear: string;
  dayOfWeek: number;
  periodNumber: number;
  subjectName: string;
  teacherUserId: string | null;
  startTime: string;
  endTime: string;
};

type ClassRow = { id: string; name: string; section: string | null; academicYear: string };
type TeacherClassesResponse = { classIds: string[]; classes: ClassRow[] };
type SubjectRow = { id: string; name: string };

export default function TimetablePage() {
  const { can, isAuthenticated, isLoading } = useAuth();
  const isManage = can("timetable.manage");
  const canView = can("timetable.view");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [academicYear, setAcademicYear] = useState("2026-27");
  const [selectedClassId, setSelectedClassId] = useState("0fcd1bb8-7019-4f91-842c-bec41cb39232");
  const [selectedDayMobile, setSelectedDayMobile] = useState<number>(getTodayDayNumber() ?? 1);
  const [editingCell, setEditingCell] = useState<{ dayOfWeek: number; periodNumber: number } | null>(null);
  const [form, setForm] = useState({ subjectName: "", startTime: "", endTime: "", teacherUserId: "" });

  useEffect(() => {
    if (!isLoading && !canView) setLocation("/portal/dashboard");
  }, [canView, isLoading, setLocation]);

  const teacherClassesQuery = useQuery<TeacherClassesResponse>({
    queryKey: ["/api/teacher/classes/me"],
    enabled: isAuthenticated && isManage,
  });

  useEffect(() => {
    if (isManage && teacherClassesQuery.data?.classes?.length && !selectedClassId) {
      setSelectedClassId(teacherClassesQuery.data.classes[0].id);
    }
  }, [isManage, selectedClassId, teacherClassesQuery.data?.classes]);

  const timetableQuery = useQuery<TimetableSlot[]>({
    queryKey: ["/api/timetable", isManage ? selectedClassId : "student", academicYear],
    queryFn: async () => {
      const url = isManage
        ? `/api/classes/${selectedClassId}/timetable?academicYear=${encodeURIComponent(academicYear)}`
        : `/api/student/timetable?academicYear=${encodeURIComponent(academicYear)}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    enabled: isAuthenticated && !!academicYear && (!!selectedClassId || !isManage),
  });

  const subjectsQuery = useQuery<SubjectRow[]>({
    queryKey: ["/api/classes", selectedClassId, "subjects", academicYear],
    queryFn: async () => {
      const response = await fetch(
        `/api/classes/${selectedClassId}/subjects?academicYear=${encodeURIComponent(academicYear)}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    enabled: isManage && !!selectedClassId,
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      if (!editingCell) return;
      const response = await apiRequest("POST", `/api/classes/${selectedClassId}/timetable`, {
        dayOfWeek: editingCell.dayOfWeek,
        periodNumber: editingCell.periodNumber,
        subjectName: form.subjectName.trim(),
        teacherUserId: form.teacherUserId || null,
        startTime: form.startTime,
        endTime: form.endTime,
        academicYear,
      });
      return response.json();
    },
    onSuccess: () => {
      setEditingCell(null);
      queryClient.invalidateQueries({ queryKey: ["/api/timetable", selectedClassId, academicYear] });
      queryClient.invalidateQueries({ queryKey: ["/api/timetable", "student", academicYear] });
      toast({ title: "All changes saved" });
    },
    onError: (error: Error) =>
      toast({ title: "Failed to save timetable slot", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!editingCell) return;
      await apiRequest("DELETE", `/api/classes/${selectedClassId}/timetable`, {
        dayOfWeek: editingCell.dayOfWeek,
        periodNumber: editingCell.periodNumber,
        academicYear,
      });
    },
    onSuccess: () => {
      setEditingCell(null);
      queryClient.invalidateQueries({ queryKey: ["/api/timetable", selectedClassId, academicYear] });
      queryClient.invalidateQueries({ queryKey: ["/api/timetable", "student", academicYear] });
      toast({ title: "All changes saved" });
    },
    onError: (error: Error) =>
      toast({ title: "Failed to delete slot", description: error.message, variant: "destructive" }),
  });

  const slotsByKey = useMemo(() => {
    const map = new Map<string, TimetableSlot>();
    for (const slot of timetableQuery.data ?? []) {
      map.set(`${slot.dayOfWeek}-${slot.periodNumber}`, slot);
    }
    return map;
  }, [timetableQuery.data]);

  const today = getTodayDayNumber();
  const currentPeriod = getCurrentPeriod();

  const openEdit = (dayOfWeek: number, periodNumber: number) => {
    if (!isManage) return;
    const existing = slotsByKey.get(`${dayOfWeek}-${periodNumber}`);
    const defaultTime = DEFAULT_PERIOD_TIMES[periodNumber];
    setEditingCell({ dayOfWeek, periodNumber });
    setForm({
      subjectName: existing?.subjectName ?? "",
      startTime: existing?.startTime ?? defaultTime.start,
      endTime: existing?.endTime ?? defaultTime.end,
      teacherUserId: existing?.teacherUserId ?? "",
    });
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <PageSkeleton />
      </PortalLayout>
    );
  }

  if (!canView) return null;

  const todaysSlots =
    today == null
      ? []
      : PERIODS.map((period) => slotsByKey.get(`${today}-${period}`)).filter((slot): slot is TimetableSlot => !!slot);

  return (
    <PortalLayout>
      <div className="min-h-screen bg-background font-sans">
        <PageHeader
          title={isManage ? "Timetable" : "My Timetable"}
          subtitle={isManage ? "Manage your class schedule" : academicYear}
        />
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            {isManage ? (
              <div className="w-full md:max-w-xs">
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {(teacherClassesQuery.data?.classes ?? []).map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {`${cls.name}${cls.section ? ` - ${cls.section}` : ""}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="w-full md:max-w-xs">
              <Input className="rounded-none" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
            </div>
            {isManage ? (
              <Badge variant="secondary" className="rounded-none w-fit">
                {upsertMutation.isPending || deleteMutation.isPending ? "Saving..." : "All changes saved"}
              </Badge>
            ) : null}
          </div>

          {!isManage ? (
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-serif font-normal text-xl">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {today == null ? (
                  <p className="text-sm text-muted-foreground">No school today</p>
                ) : todaysSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No periods scheduled for today.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {todaysSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`px-3 py-1 text-sm border ${
                          currentPeriod === slot.periodNumber
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-secondary text-foreground"
                        }`}
                      >
                        {`P${slot.periodNumber} · ${slot.subjectName} · ${slot.startTime}-${slot.endTime}`}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {timetableQuery.isLoading ? (
            <PageSkeleton />
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto border border-border">
                <div className="grid" style={{ gridTemplateColumns: "10rem repeat(6, minmax(9rem, 1fr))" }}>
                  <div className="border-b border-r border-border bg-card p-2 text-xs text-muted-foreground">Period</div>
                  {DAYS.map((day) => (
                    <div
                      key={day.value}
                      className={`border-b border-r border-border p-2 text-center text-sm ${
                        today === day.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {day.label}
                    </div>
                  ))}

                  {PERIODS.map((period) => (
                    <div key={period} className="contents">
                      <div
                        className={`border-b border-r border-border p-2 text-xs ${
                          currentPeriod === period ? "border-l-2 border-l-gold bg-gold/10" : "bg-card"
                        }`}
                      >
                        {`P${period} ${DEFAULT_PERIOD_TIMES[period].start}-${DEFAULT_PERIOD_TIMES[period].end}`}
                      </div>
                      {DAYS.map((day) => {
                        const slot = slotsByKey.get(`${day.value}-${period}`);
                        const isActiveNow = today === day.value && currentPeriod === period;
                        return (
                          <button
                            key={`${day.value}-${period}`}
                            type="button"
                            className={`border-b border-r border-border p-2 min-h-[4.5rem] text-left ${
                              isManage ? "hover:bg-secondary/50" : ""
                            } ${isActiveNow ? "ring-1 ring-primary/40" : ""}`}
                            onClick={() => openEdit(day.value, period)}
                            disabled={!isManage}
                          >
                            {slot ? (
                              <div className={`border px-2 py-1 text-xs ${subjectColor(slot.subjectName)}`}>
                                <p className="font-medium">{slot.subjectName}</p>
                                <p className="text-[10px] opacity-80">{`${slot.startTime}-${slot.endTime}`}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">{isManage ? "+" : "—"}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:hidden space-y-3">
                <div className="flex gap-2 overflow-x-auto">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className={`border px-3 py-2 text-sm ${
                        selectedDayMobile === day.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border"
                      }`}
                      onClick={() => setSelectedDayMobile(day.value)}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {PERIODS.map((period) => {
                    const slot = slotsByKey.get(`${selectedDayMobile}-${period}`);
                    const isActiveNow = today === selectedDayMobile && currentPeriod === period;
                    return (
                      <button
                        type="button"
                        key={period}
                        className={`w-full border border-border p-3 text-left ${isActiveNow ? "ring-1 ring-primary/40" : ""}`}
                        onClick={() => openEdit(selectedDayMobile, period)}
                        disabled={!isManage}
                      >
                        <p className="text-xs text-muted-foreground">
                          {`P${period} ${DEFAULT_PERIOD_TIMES[period].start}-${DEFAULT_PERIOD_TIMES[period].end}`}
                        </p>
                        {slot ? (
                          <div className={`mt-1 inline-block border px-2 py-1 text-xs ${subjectColor(slot.subjectName)}`}>
                            {slot.subjectName}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">{isManage ? "+" : "—"}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {isManage && editingCell ? (
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-serif font-normal text-lg">
                  {`Edit Slot - ${DAYS.find((d) => d.value === editingCell.dayOfWeek)?.label} P${editingCell.periodNumber}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={form.subjectName} onValueChange={(value) => setForm((p) => ({ ...p, subjectName: value }))}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {(subjectsQuery.data ?? []).map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="time"
                    className="rounded-none"
                    value={form.startTime}
                    onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                  />
                  <Input
                    type="time"
                    className="rounded-none"
                    value={form.endTime}
                    onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="rounded-none"
                    disabled={upsertMutation.isPending || !form.subjectName.trim()}
                    onClick={() => upsertMutation.mutate()}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-none"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate()}
                  >
                    Clear
                  </Button>
                  <Button variant="outline" className="rounded-none" onClick={() => setEditingCell(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </PortalLayout>
  );
}
