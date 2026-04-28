import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { computeGrade, computePercent, gradeColorClass } from "@/lib/marks-utils";

type TeacherClassesResponse = {
  classIds: string[];
  classes: Array<{ id: string; name: string; section: string | null; academicYear: string }>;
};

type SubjectRow = { id: string; name: string; classId: string; academicYear: string };
type ExamRow = {
  id: string;
  classId: string;
  subjectId: string;
  title: string;
  examDate: string;
  maxMarks: number;
  passingMarks: number;
  academicYear: string;
};

type ExamResultEntry = {
  studentUser: { id: string; username: string; firstName: string | null; lastName: string | null };
  result: { marksObtained: number; remarks: string | null } | null;
};

type StudentMarksRow = {
  exam: ExamRow;
  result: { marksObtained: number; remarks: string | null } | null;
  subject: SubjectRow | null;
};

const currentAcademicYear = "2026-27";

export default function MarksPage() {
  const { can, isAuthenticated, isLoading } = useAuth();
  const isTeacher = can("marks.enter");
  const canView = can("marks.view");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [academicYear, setAcademicYear] = useState(currentAcademicYear);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [createForm, setCreateForm] = useState({
    subjectId: "",
    title: "",
    examDate: "",
    maxMarks: "100",
    passingMarks: "35",
  });
  const [draftRows, setDraftRows] = useState<Record<string, { marks: string; remarks: string }>>({});

  useEffect(() => {
    if (!isLoading && !canView) {
      setLocation("/portal/dashboard");
    }
  }, [canView, isLoading, setLocation]);

  const teacherClassesQuery = useQuery<TeacherClassesResponse>({
    queryKey: ["/api/teacher/classes/me"],
    enabled: isAuthenticated && isTeacher,
  });

  useEffect(() => {
    if (isTeacher && !selectedClassId && teacherClassesQuery.data?.classes?.length) {
      setSelectedClassId(teacherClassesQuery.data.classes[0].id);
    }
  }, [isTeacher, selectedClassId, teacherClassesQuery.data?.classes]);

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
    enabled: isTeacher && !!selectedClassId,
  });

  const examsQuery = useQuery<ExamRow[]>({
    queryKey: ["/api/classes", selectedClassId, "exams", academicYear],
    queryFn: async () => {
      const response = await fetch(
        `/api/classes/${selectedClassId}/exams?academicYear=${encodeURIComponent(academicYear)}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    enabled: isTeacher && !!selectedClassId,
  });

  useEffect(() => {
    if (!selectedExamId && examsQuery.data?.length) {
      setSelectedExamId(examsQuery.data[0].id);
    }
  }, [examsQuery.data, selectedExamId]);

  const resultsQuery = useQuery<ExamResultEntry[]>({
    queryKey: ["/api/exams", selectedExamId, "results"],
    queryFn: async () => {
      const response = await fetch(`/api/exams/${selectedExamId}/results`, { credentials: "include" });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    enabled: isTeacher && !!selectedExamId,
  });

  useEffect(() => {
    if (!resultsQuery.data) return;
    const next: Record<string, { marks: string; remarks: string }> = {};
    for (const row of resultsQuery.data) {
      next[row.studentUser.id] = {
        marks: row.result?.marksObtained !== undefined && row.result?.marksObtained !== null ? String(row.result.marksObtained) : "",
        remarks: row.result?.remarks ?? "",
      };
    }
    setDraftRows(next);
  }, [resultsQuery.data, selectedExamId]);

  const studentMarksQuery = useQuery<StudentMarksRow[]>({
    queryKey: ["/api/student/marks", academicYear],
    queryFn: async () => {
      const response = await fetch(`/api/student/marks?academicYear=${encodeURIComponent(academicYear)}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    enabled: isAuthenticated && !isTeacher && canView,
  });

  const createExamMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/classes/${selectedClassId}/exams`, {
        subjectId: createForm.subjectId,
        title: createForm.title.trim(),
        examDate: new Date(`${createForm.examDate}T09:00:00`).toISOString(),
        maxMarks: Number(createForm.maxMarks),
        passingMarks: Number(createForm.passingMarks),
        academicYear,
      });
      return response.json();
    },
    onSuccess: () => {
      setShowCreateExam(false);
      setCreateForm({ subjectId: "", title: "", examDate: "", maxMarks: "100", passingMarks: "35" });
      queryClient.invalidateQueries({ queryKey: ["/api/classes", selectedClassId, "exams", academicYear] });
      toast({ title: "Exam created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create exam", description: error.message, variant: "destructive" });
    },
  });

  const saveMarksMutation = useMutation({
    mutationFn: async () => {
      const exam = (examsQuery.data ?? []).find((row) => row.id === selectedExamId);
      if (!exam) throw new Error("Select an exam first");
      const payload = Object.entries(draftRows)
        .filter(([, value]) => value.marks.trim() !== "")
        .map(([studentUserId, value]) => ({
          studentUserId,
          marksObtained: Number(value.marks),
          remarks: value.remarks.trim() || undefined,
        }));
      const response = await apiRequest("POST", `/api/exams/${selectedExamId}/results/bulk`, { results: payload });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams", selectedExamId, "results"] });
      toast({ title: "Marks saved successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save marks", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <PortalLayout>
        <PageSkeleton />
      </PortalLayout>
    );
  }

  if (!canView) return null;

  if (isTeacher) {
    const subjectNameById = new Map((subjectsQuery.data ?? []).map((subject) => [subject.id, subject.name]));
    const selectedExam = (examsQuery.data ?? []).find((row) => row.id === selectedExamId);
    return (
      <PortalLayout>
        <div className="min-h-screen bg-background font-sans">
          <PageHeader title="Marks & Exams" subtitle="Manage exams and enter student marks" />
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
            <Card className="rounded-none">
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={selectedClassId || undefined} onValueChange={(value) => setSelectedClassId(value)}>
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
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Input className="rounded-none" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif font-normal text-xl">Exams</CardTitle>
                  <Button variant="outline" className="rounded-none" onClick={() => setShowCreateExam((p) => !p)}>
                    + Create Exam
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {showCreateExam ? (
                    <div className="border border-border p-3 space-y-3">
                      <Select
                        value={createForm.subjectId || undefined}
                        onValueChange={(value) => setCreateForm((p) => ({ ...p, subjectId: value }))}
                      >
                        <SelectTrigger className="rounded-none">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {(subjectsQuery.data ?? []).map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="rounded-none"
                        placeholder="Exam title"
                        value={createForm.title}
                        onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                      />
                      <Input
                        type="date"
                        className="rounded-none"
                        value={createForm.examDate}
                        onChange={(e) => setCreateForm((p) => ({ ...p, examDate: e.target.value }))}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          min={1}
                          className="rounded-none"
                          value={createForm.maxMarks}
                          onChange={(e) => setCreateForm((p) => ({ ...p, maxMarks: e.target.value }))}
                        />
                        <Input
                          type="number"
                          min={0}
                          className="rounded-none"
                          value={createForm.passingMarks}
                          onChange={(e) => setCreateForm((p) => ({ ...p, passingMarks: e.target.value }))}
                        />
                      </div>
                      <Button
                        className="rounded-none w-full"
                        disabled={
                          createExamMutation.isPending ||
                          !createForm.subjectId ||
                          !createForm.title.trim() ||
                          !createForm.examDate
                        }
                        onClick={() => createExamMutation.mutate()}
                      >
                        {createExamMutation.isPending ? "Creating..." : "Create Exam"}
                      </Button>
                    </div>
                  ) : null}

                  {(examsQuery.data ?? []).map((exam) => (
                    <div
                      key={exam.id}
                      className={`border p-3 ${
                        selectedExamId === exam.id ? "border-primary border-l-2" : "border-border"
                      }`}
                    >
                      <p className="font-medium text-foreground">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {subjectNameById.get(exam.subjectId) || "Subject"} • {format(new Date(exam.examDate), "dd MMM yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max {exam.maxMarks} • Pass {exam.passingMarks}
                      </p>
                      <Button
                        variant="outline"
                        className="rounded-none mt-2"
                        onClick={() => setSelectedExamId(exam.id)}
                      >
                        Enter Marks
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-none">
                <CardHeader>
                  <CardTitle className="font-serif font-normal text-xl">
                    {selectedExam ? `${selectedExam.title} — Marks Entry` : "Select an exam"}
                  </CardTitle>
                  {selectedExam ? (
                    <p className="text-sm text-muted-foreground">
                      {subjectNameById.get(selectedExam.subjectId) || "Subject"} • Max Marks {selectedExam.maxMarks}
                    </p>
                  ) : null}
                </CardHeader>
                <CardContent>
                  {!selectedExam ? (
                    <p className="text-sm text-muted-foreground">Choose an exam from the list to enter marks.</p>
                  ) : (
                    <div className="space-y-3">
                      {(resultsQuery.data ?? []).map((row, index) => {
                        const key = row.studentUser.id;
                        const draft = draftRows[key] ?? { marks: "", remarks: "" };
                        const marksNumber = draft.marks === "" ? null : Number(draft.marks);
                        const grade =
                          marksNumber === null || Number.isNaN(marksNumber)
                            ? "—"
                            : computeGrade(marksNumber, selectedExam.maxMarks);
                        const studentName =
                          `${row.studentUser.firstName ?? ""} ${row.studentUser.lastName ?? ""}`.trim() ||
                          row.studentUser.username;
                        return (
                          <div key={row.studentUser.id} className="grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr_0.5fr_1fr] gap-2 border border-border p-3">
                            <p className="font-medium text-foreground">{studentName}</p>
                            <Input
                              type="number"
                              min={0}
                              max={selectedExam.maxMarks}
                              value={draft.marks}
                              placeholder="—"
                              data-index={index}
                              className="rounded-none"
                              onChange={(e) =>
                                setDraftRows((prev) => ({
                                  ...prev,
                                  [key]: { ...prev[key], marks: e.target.value },
                                }))
                              }
                              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                                if (e.key !== "Tab" || e.shiftKey) return;
                                const next = document.querySelector<HTMLInputElement>(
                                  `input[data-index="${index + 1}"]`
                                );
                                if (next) {
                                  e.preventDefault();
                                  next.focus();
                                }
                              }}
                            />
                            <Badge className={`rounded-none justify-center ${gradeColorClass(grade)}`}>{grade}</Badge>
                            <Input
                              className="rounded-none"
                              placeholder="Remarks (optional)"
                              value={draft.remarks}
                              onChange={(e) =>
                                setDraftRows((prev) => ({
                                  ...prev,
                                  [key]: { ...prev[key], remarks: e.target.value },
                                }))
                              }
                            />
                          </div>
                        );
                      })}
                      <Button
                        className="rounded-none"
                        disabled={saveMarksMutation.isPending}
                        onClick={() => saveMarksMutation.mutate()}
                      >
                        {saveMarksMutation.isPending ? "Saving..." : "Save All Marks"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const rows = studentMarksQuery.data ?? [];
  const grouped = rows.reduce<Record<string, StudentMarksRow[]>>((acc, row) => {
    const key = row.subject?.name ?? "Unknown Subject";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  const completedResults = rows.filter((row) => !!row.result);
  const totalExams = completedResults.length;
  const overallAverage =
    totalExams === 0
      ? 0
      : Math.round(
          completedResults.reduce((sum, row) => {
            return sum + computePercent(row.result!.marksObtained, row.exam.maxMarks);
          }, 0) / totalExams
        );

  const subjectAverages = Object.entries(grouped).map(([subjectName, subjectRows]) => {
    const entered = subjectRows.filter((row) => !!row.result);
    const avg =
      entered.length === 0
        ? 0
        : Math.round(
            entered.reduce((sum, row) => sum + computePercent(row.result!.marksObtained, row.exam.maxMarks), 0) /
              entered.length
          );
    return { subjectName, avg };
  });
  const bestSubject = subjectAverages.sort((a, b) => b.avg - a.avg)[0]?.subjectName ?? "—";

  const gradeDistribution = completedResults.reduce<Record<string, number>>((acc, row) => {
    const grade = computeGrade(row.result!.marksObtained, row.exam.maxMarks);
    acc[grade] = (acc[grade] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PortalLayout>
      <div className="min-h-screen bg-background font-sans">
        <PageHeader title="My Marks" subtitle="Exam results and performance overview" />
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          <div className="max-w-sm">
            <Label>Academic Year</Label>
            <Input className="rounded-none mt-2" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
          </div>

          {studentMarksQuery.isLoading ? (
            <PageSkeleton />
          ) : rows.length === 0 ? (
            <Card className="rounded-none">
              <CardContent className="py-12 text-center text-muted-foreground">
                No exam results yet for this academic year.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="rounded-none"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Exams</p><p className="text-2xl font-semibold">{totalExams}</p></CardContent></Card>
                <Card className="rounded-none"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Overall Average</p><p className="text-2xl font-semibold">{overallAverage}%</p></CardContent></Card>
                <Card className="rounded-none"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Best Subject</p><p className="text-lg font-semibold">{bestSubject}</p></CardContent></Card>
                <Card className="rounded-none"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-2">Grade Distribution</p><p className="text-sm text-foreground">A+:{gradeDistribution["A+"] ?? 0} A:{gradeDistribution["A"] ?? 0} B+:{gradeDistribution["B+"] ?? 0} B:{gradeDistribution["B"] ?? 0} C:{gradeDistribution["C"] ?? 0} F:{gradeDistribution["F"] ?? 0}</p></CardContent></Card>
              </div>

              {Object.entries(grouped).map(([subjectName, subjectRows]) => {
                const entered = subjectRows.filter((row) => !!row.result);
                const average =
                  entered.length === 0
                    ? 0
                    : Math.round(
                        entered.reduce((sum, row) => sum + computePercent(row.result!.marksObtained, row.exam.maxMarks), 0) /
                          entered.length
                      );
                return (
                  <Card key={subjectName} className="rounded-none">
                    <CardHeader>
                      <CardTitle className="font-serif font-normal text-xl">{subjectName}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {subjectRows.map((row) => {
                        const marks = row.result?.marksObtained;
                        const grade = marks !== undefined && marks !== null ? computeGrade(marks, row.exam.maxMarks) : "—";
                        const passFail =
                          marks !== undefined && marks !== null
                            ? marks >= row.exam.passingMarks
                              ? "Pass"
                              : "Fail"
                            : "Pending";
                        return (
                          <div key={row.exam.id} className="grid grid-cols-6 gap-2 border border-border p-2 text-sm">
                            <span>{row.exam.title}</span>
                            <span>{format(new Date(row.exam.examDate), "dd MMM yyyy")}</span>
                            <span>{marks ?? "—"}</span>
                            <span>{row.exam.maxMarks}</span>
                            <Badge className={`rounded-none w-fit ${gradeColorClass(grade)}`}>{grade}</Badge>
                            <span className="text-muted-foreground">{passFail}</span>
                          </div>
                        );
                      })}
                      <p className="text-sm text-muted-foreground">Average: {average}%</p>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
