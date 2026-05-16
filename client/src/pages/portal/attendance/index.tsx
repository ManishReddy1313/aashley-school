import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, getDaysInMonth, startOfMonth } from "date-fns";
import { CheckSquare, Download, Send, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "@/hooks/use-auth";
import { useActiveClass } from "@/contexts/active-class-context";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 3 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
})();

type AttendanceRecord = {
  studentUserId: string;
  studentName: string;
  status: "present" | "absent" | "late" | null;
};

type SummaryRow = {
  studentUserId: string;
  studentName: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
};

type MonthlyRecord = {
  id: string;
  studentUserId: string;
  date: string;
  status: string;
};

function StatusPill({ status }: { status: string | null }) {
  if (status === "present") return <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg">Present</span>;
  if (status === "absent") return <span className="px-2 py-0.5 text-xs font-medium bg-red-50 text-destructive rounded-lg">Absent</span>;
  if (status === "late") return <span className="px-2 py-0.5 text-xs font-medium bg-orange-50 text-orange-700 rounded-lg">Late</span>;
  return <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded-lg">—</span>;
}

export default function AttendancePage() {
  const { user, isAdmin, isSuperAdmin, isPrincipal, isClassTeacher, isSubjectTeacher, can } = useAuth();
  const { activeClassId, activeClass } = useActiveClass();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isTeacher = !!(isClassTeacher || isSubjectTeacher);
  const isAdminRole = !!(isAdmin || isSuperAdmin || isPrincipal);
  const isStudent = user?.role === "student" || user?.role === "parent";

  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [academicYear, setAcademicYear] = useState(CURRENT_ACADEMIC_YEAR);
  const [marks, setMarks] = useState<Record<string, "present" | "absent" | "late">>({});
  const [notificationSent, setNotificationSent] = useState(false);

  const classId = activeClassId ?? "";

  const attendanceQuery = useQuery({
    queryKey: ["/api/attendance", classId, selectedDate],
    queryFn: async (): Promise<AttendanceRecord[]> => {
      if (!classId) return [] as AttendanceRecord[];
      const res = await fetch(`/api/attendance/${classId}?date=${selectedDate}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return (res.json() as Promise<AttendanceRecord[]>);
    },
    enabled: !!(classId && (isTeacher || isAdminRole)),
  });
  const attendanceData: AttendanceRecord[] = attendanceQuery.data ?? [];
  const attendanceLoading = attendanceQuery.isLoading;

  useEffect(() => {
    const data = attendanceQuery.data;
    if (!data) return;
    const initial: Record<string, "present" | "absent" | "late"> = {};
    for (const row of data) {
      if (row.status) initial[row.studentUserId] = row.status;
    }
    setMarks(initial);
    setNotificationSent(false);
  }, [attendanceQuery.data]);

  const summaryQuery = useQuery({
    queryKey: ["/api/attendance", classId, "summary", academicYear],
    queryFn: async (): Promise<SummaryRow[]> => {
      const res = await fetch(`/api/attendance/${classId}/summary?academicYear=${academicYear}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<SummaryRow[]>;
    },
    enabled: !!(classId && (isTeacher || isAdminRole)),
  });
  const summaryData: SummaryRow[] = summaryQuery.data ?? [];
  const summaryLoading = summaryQuery.isLoading;

  const monthlyQuery = useQuery({
    queryKey: ["/api/attendance", classId, "monthly", selectedMonth],
    queryFn: async (): Promise<MonthlyRecord[]> => {
      const res = await fetch(`/api/attendance/${classId}/monthly?month=${selectedMonth}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<MonthlyRecord[]>;
    },
    enabled: !!(classId && (isTeacher || isAdminRole)),
  });
  const monthlyData: MonthlyRecord[] = monthlyQuery.data ?? [];
  const monthlyLoading = monthlyQuery.isLoading;

  const studentAttendanceQuery = useQuery({
    queryKey: ["/api/student/attendance", academicYear],
    queryFn: async (): Promise<{ present: number; absent: number; late: number; total: number; records: MonthlyRecord[] }> => {
      const res = await fetch(`/api/student/attendance?academicYear=${academicYear}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ present: number; absent: number; late: number; total: number; records: MonthlyRecord[] }>;
    },
    enabled: isStudent,
  });
  const studentAttendance = studentAttendanceQuery.data;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const records = Object.entries(marks).map(([studentUserId, status]) => ({ studentUserId, status }));
      const res = await apiRequest("POST", `/api/attendance/${classId}`, { date: selectedDate, academicYear, records });
      return res.json();
    },
    onSuccess: (data: { saved: number }) => {
      toast({ title: `Attendance saved for ${data.saved} students` });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance", classId] });
    },
    onError: () => toast({ title: "Failed to save attendance", variant: "destructive" }),
  });

  const notifyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/attendance/${classId}/notify`, { date: selectedDate });
      return res.json();
    },
    onSuccess: (data: { notified: number }) => {
      toast({ title: `Notified ${data.notified} parents of absent students` });
      setNotificationSent(true);
    },
    onError: () => toast({ title: "Failed to send notifications", variant: "destructive" }),
  });

  const markCount = (status: string) => attendanceData.filter((r) => (marks[r.studentUserId] ?? r.status) === status).length;
  const unmarked = attendanceData.filter((r) => !marks[r.studentUserId] && !r.status).length;
  const todayAlreadyMarked = attendanceData.length > 0 && attendanceData.every((r) => r.status !== null);

  // Monthly grid
  const daysInMonth = getDaysInMonth(new Date(selectedMonth + "-01"));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthlyMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    for (const rec of monthlyData) {
      const day = String(new Date(rec.date).getDate());
      if (!map[rec.studentUserId]) map[rec.studentUserId] = {};
      map[rec.studentUserId][day] = rec.status;
    }
    return map;
  }, [monthlyData]);

  const uniqueStudentIds = useMemo(() => {
    return Array.from(new Set(monthlyData.map((r) => r.studentUserId)));
  }, [monthlyData]);

  const exportMonthly = () => {
    const headers = ["Student ID", ...days.map((d) => String(d))];
    const rows = uniqueStudentIds.map((sid) => {
      const studentRow = attendanceData.find((r) => r.studentUserId === sid);
      return [
        studentRow?.studentName ?? sid,
        ...days.map((d) => monthlyMap[sid]?.[String(d)] ?? "—"),
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Attendance");
    XLSX.writeFile(wb, `attendance-${selectedMonth}.xlsx`);
  };

  if (isStudent) {
    const summary = studentAttendance;
    const percentage = summary && summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0;
    return (
      <PortalLayout>
        <PageHeader title="My Attendance" subtitle={`Academic Year ${academicYear}`} />
        <div className="p-6 bg-secondary min-h-[calc(100vh-80px)] space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Present", value: summary?.present ?? 0, cls: "text-emerald-700" },
              { label: "Absent", value: summary?.absent ?? 0, cls: "text-destructive" },
              { label: "Late", value: summary?.late ?? 0, cls: "text-orange-700" },
              { label: "Total Days", value: summary?.total ?? 0, cls: "text-foreground" },
            ].map((s) => (
              <Card key={s.label} className="shadow-sm">
                <CardContent className="pt-4">
                  <p className={`font-serif text-4xl font-normal ${s.cls}`}>{s.value}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif font-normal text-xl">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full border-4 border-border flex items-center justify-center">
                  <span className={`font-serif text-2xl ${percentage >= 75 ? "text-emerald-700" : percentage >= 60 ? "text-orange-700" : "text-destructive"}`}>{percentage}%</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{percentage >= 75 ? "Good standing" : percentage >= 60 ? "At risk — attend more classes" : "Critical — below 60% attendance"}</p>
                  {percentage < 75 && (
                    <div className="mt-2 flex items-center gap-1 text-orange-700 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      Minimum 75% required
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  if (!classId && !isAdminRole) {
    return (
      <PortalLayout>
        <PageHeader title="Attendance" />
        <div className="p-6 bg-secondary min-h-[calc(100vh-80px)] flex items-center justify-center">
          <Card className="shadow-sm max-w-sm w-full text-center p-8">
            <Users className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">No class selected</p>
            <p className="text-sm text-muted-foreground mt-1">Select a class from the sidebar to view attendance.</p>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <PageHeader
        title="Attendance"
        subtitle={activeClass ? `${activeClass.name}${activeClass.section ? ` ${activeClass.section}` : ""}` : ""}
      />
      <div className="p-6 bg-secondary min-h-[calc(100vh-80px)]">
        <Tabs defaultValue="mark">
          <TabsList className="mb-4">
            <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
            <TabsTrigger value="summary">Student Summary</TabsTrigger>
          </TabsList>

          {/* TAB 1: Mark Attendance */}
          <TabsContent value="mark" className="space-y-4">
            <Card className="shadow-sm">
              <CardContent className="pt-4 flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Date</label>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-40" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Academic Year</label>
                  <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-28" />
                </div>
              </CardContent>
            </Card>

            {selectedDate === today && !todayAlreadyMarked && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-none">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-orange-800">Attendance not marked for today</p>
                  <p className="text-sm text-orange-700">Mark attendance below and click "Save Attendance"</p>
                </div>
              </div>
            )}

            {attendanceLoading ? (
              <Card className="shadow-sm"><CardContent className="pt-6 text-center text-muted-foreground">Loading...</CardContent></Card>
            ) : attendanceData.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="pt-8 text-center">
                  <CheckSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No students in this class</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 pr-4 font-medium text-muted-foreground">#</th>
                          <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Student</th>
                          <th className="text-center py-2 font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceData.map((student, idx) => {
                          const current = marks[student.studentUserId] ?? student.status;
                          return (
                            <tr key={student.studentUserId} className="border-b border-border/50 hover:bg-secondary/50">
                              <td className="py-3 pr-4 text-muted-foreground">{idx + 1}</td>
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">
                                    {student.studentName.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium">{student.studentName}</span>
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="flex justify-center gap-1">
                                  {(["present", "absent", "late"] as const).map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => setMarks((prev) => ({ ...prev, [student.studentUserId]: s }))}
                                      className={`px-3 py-1 text-xs font-medium border transition-all ${
                                        current === s
                                          ? s === "present"
                                            ? "bg-emerald-600 text-white border-emerald-600"
                                            : s === "absent"
                                            ? "bg-destructive text-white border-destructive"
                                            : "bg-orange-500 text-white border-orange-500"
                                          : "bg-card border-border text-muted-foreground hover:border-foreground"
                                      }`}
                                    >
                                      {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-3 text-sm">
                      <span className="text-emerald-700 font-medium">{markCount("present")} Present</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-destructive font-medium">{markCount("absent")} Absent</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-orange-700 font-medium">{markCount("late")} Late</span>
                      {unmarked > 0 && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{unmarked} Unmarked</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {notificationSent ? (
                        <div className="flex items-center gap-1 text-emerald-700 text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          Notifications sent
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => notifyMutation.mutate()} disabled={notifyMutation.isPending}>
                          <Send className="h-3.5 w-3.5 mr-1.5" />
                          Notify Absent Parents
                        </Button>
                      )}
                      <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? "Saving..." : "Save Attendance"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 2: Monthly Report */}
          <TabsContent value="monthly" className="space-y-4">
            <Card className="shadow-sm">
              <CardContent className="pt-4 flex flex-wrap gap-3 items-end justify-between">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Month</label>
                  <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-40" />
                </div>
                <Button variant="outline" size="sm" onClick={exportMonthly}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export Excel
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-4 overflow-x-auto">
                {monthlyLoading ? (
                  <p className="text-center text-muted-foreground py-4">Loading...</p>
                ) : uniqueStudentIds.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No attendance data for this month</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-3 font-medium text-muted-foreground min-w-[120px]">Student</th>
                        {days.map((d) => (
                          <th key={d} className="text-center py-2 px-1 font-medium text-muted-foreground w-7">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueStudentIds.map((sid) => {
                        const studentRow = attendanceData.find((r) => r.studentUserId === sid);
                        return (
                          <tr key={sid} className="border-b border-border/50">
                            <td className="py-2 pr-3 font-medium">{studentRow?.studentName ?? sid.slice(0, 8)}</td>
                            {days.map((d) => {
                              const st = monthlyMap[sid]?.[String(d)];
                              return (
                                <td key={d} className="text-center py-2 px-1">
                                  {st === "present" ? <span className="text-emerald-600 font-bold">P</span>
                                    : st === "absent" ? <span className="text-destructive font-bold">A</span>
                                    : st === "late" ? <span className="text-orange-600 font-bold">L</span>
                                    : <span className="text-muted-foreground/40">—</span>}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Student Summary */}
          <TabsContent value="summary" className="space-y-4">
            <Card className="shadow-sm">
              <CardContent className="pt-4 flex gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Academic Year</label>
                  <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-28" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-4 overflow-x-auto">
                {summaryLoading ? (
                  <p className="text-center text-muted-foreground py-4">Loading...</p>
                ) : summaryData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No attendance data yet</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Student</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Present</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Absent</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Late</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Total</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...summaryData].sort((a, b) => a.percentage - b.percentage).map((row) => (
                        <tr key={row.studentUserId} className="border-b border-border/50 hover:bg-secondary/50">
                          <td className="py-3 pr-4 font-medium">{row.studentName}</td>
                          <td className="py-3 text-center text-emerald-700">{row.present}</td>
                          <td className="py-3 text-center text-destructive">{row.absent}</td>
                          <td className="py-3 text-center text-orange-700">{row.late}</td>
                          <td className="py-3 text-center">{row.total}</td>
                          <td className="py-3 text-center">
                            <span className={`font-semibold ${row.percentage >= 75 ? "text-emerald-700" : row.percentage >= 60 ? "text-orange-700" : "text-destructive"}`}>
                              {row.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}
