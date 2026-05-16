import { useCallback, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Download, Loader2, Upload } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadStudentTemplate, downloadTeacherTemplate } from "@/lib/excel-templates";
import {
  generatePassword,
  maskPassword,
  parseStudentExcel,
  parseTeacherExcel,
  type ParseResult,
  type StudentRow,
  type TeacherRow,
} from "@/lib/excel-parser";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ClassOption = { id: string; name: string; section: string | null };

export interface BulkUploadSheetProps {
  type: "teacher" | "student";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  availableClasses?: ClassOption[];
}

type BulkSummary = {
  created: number;
  skipped: number;
  errors: string[];
  skippedDetails: Array<{ username: string; reason: string }>;
};

type CredentialRow = {
  name: string;
  username: string;
  password: string;
  role?: string;
  className?: string;
  academicYear?: string;
  phone?: string;
};

const TEACHER_REQUIRED = [
  "First Name",
  "Last Name",
  "Username",
  "Role (class_teacher, subject_teacher, admissions_officer, admin_staff)",
];

const STUDENT_REQUIRED = [
  "Admission Number",
  "First Name",
  "Last Name",
  "Class Name (e.g. Grade 8 - A)",
  "Academic Year (e.g. 2026-27)",
];

function buildCredentialsFromResult(
  type: "teacher" | "student",
  rows: Array<TeacherRow | StudentRow>,
  data: BulkSummary,
): CredentialRow[] {
  const skippedUsernames = new Set(
    data.skippedDetails.map((s) => s.username.toLowerCase()),
  );
  const creds: CredentialRow[] = [];
  let createdCount = 0;

  for (const row of rows) {
    const username =
      type === "teacher"
        ? (row as TeacherRow).username
        : (row as StudentRow).admissionNumber;
    if (skippedUsernames.has(username.toLowerCase())) continue;
    if (createdCount >= data.created) break;

    if (type === "teacher") {
      const t = row as TeacherRow;
      creds.push({
        name: `${t.firstName} ${t.lastName}`.trim(),
        username: t.username,
        password: t._generatedPassword!,
        role: t.role,
        phone: t.phone,
      });
    } else {
      const s = row as StudentRow;
      creds.push({
        name: `${s.firstName} ${s.lastName}`.trim(),
        username: s.admissionNumber,
        password: s._generatedPassword!,
        className: s.className,
        academicYear: s.academicYear,
        phone: s.phone,
      });
    }
    createdCount += 1;
  }

  return creds;
}

export function BulkUploadSheet({
  type,
  open,
  onOpenChange,
  onSuccess,
  availableClasses = [],
}: BulkUploadSheetProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult<TeacherRow> | ParseResult<StudentRow> | null>(null);
  const [validRows, setValidRows] = useState<Array<TeacherRow | StudentRow>>([]);
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [summary, setSummary] = useState<BulkSummary | null>(null);
  const [credentials, setCredentials] = useState<CredentialRow[]>([]);

  const reset = useCallback(() => {
    setStep(1);
    setParsing(false);
    setParseResult(null);
    setValidRows([]);
    setShowAllPasswords(false);
    setSummary(null);
    setCredentials([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const validOnly = useMemo(() => {
    if (!parseResult) return [];
    return parseResult.rows.filter((r) => r._status === "valid");
  }, [parseResult]);

  const errorOnly = useMemo(() => {
    if (!parseResult) return [];
    return parseResult.rows.filter((r) => r._status === "error");
  }, [parseResult]);

  const handleFile = async (file: File) => {
    setParsing(true);
    try {
      const result =
        type === "teacher"
          ? await parseTeacherExcel(file)
          : await parseStudentExcel(file, availableClasses);
      setParseResult(result);
      setStep(2);
    } catch {
      toast({ title: "Failed to parse file", variant: "destructive" });
    } finally {
      setParsing(false);
    }
  };

  const proceedToReview = () => {
    const rows = validOnly.map((row) => {
      const password = generatePassword(
        type === "student" ? (row as StudentRow).admissionNumber : undefined,
      );
      return { ...row, _generatedPassword: password };
    });
    setValidRows(rows);
    setStep(3);
  };

  const bulkMutation = useMutation({
    mutationFn: async () => {
      if (type === "teacher") {
        const payload = (validRows as TeacherRow[]).map((row) => ({
          username: row.username,
          password: row._generatedPassword!,
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone ?? null,
          email: row.email ?? null,
          role: row.role,
        }));
        const res = await apiRequest("POST", "/api/admin/users/bulk-teachers", payload);
        const data = (await res.json()) as BulkSummary;
        return { data, creds: buildCredentialsFromResult("teacher", validRows, data) };
      }

      const payload = (validRows as StudentRow[]).map((row) => ({
        username: row.admissionNumber,
        admissionNumber: row.admissionNumber,
        password: row._generatedPassword!,
        firstName: row.firstName,
        lastName: row.lastName,
        phone: row.phone ?? null,
        classId: row._classId!,
        academicYear: row.academicYear,
        rollNumber: row.rollNumber ?? null,
        dateOfBirth: row.dateOfBirth ?? null,
        gender: row.gender ?? null,
        bloodGroup: row.bloodGroup ?? null,
      }));
      const res = await apiRequest("POST", "/api/admin/users/bulk-students", payload);
      const data = (await res.json()) as BulkSummary;
      return { data, creds: buildCredentialsFromResult("student", validRows, data) };
    },
    onSuccess: ({ data, creds }) => {
      setSummary(data);
      setCredentials(creds);
      setStep(4);
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    },
  });

  const downloadCredentials = () => {
    const date = new Date().toISOString().slice(0, 10);
    if (type === "teacher") {
      const headers = ["Name", "Username", "Password", "Role", "Phone"];
      const rows = credentials.map((c) => [c.name, c.username, c.password, c.role ?? "", c.phone ?? ""]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Credentials");
      XLSX.writeFile(wb, `teacher-credentials-${date}.xlsx`);
    } else {
      const headers = ["Admission No.", "Name", "Class", "Academic Year", "Password", "Phone"];
      const rows = credentials.map((c) => [
        c.username,
        c.name,
        c.className ?? "",
        c.academicYear ?? "",
        c.password,
        c.phone ?? "",
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Credentials");
      XLSX.writeFile(wb, `student-credentials-${date}.xlsx`);
    }
  };

  const classSummary =
    type === "student" && validRows.length > 0
      ? Array.from(new Set((validRows as StudentRow[]).map((r) => r.className))).join(", ")
      : null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif font-normal text-2xl">
            Bulk Upload {type === "teacher" ? "Teachers" : "Students"}
          </SheetTitle>
          <SheetDescription>Import accounts from an Excel spreadsheet.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">Step 1 — Download Template</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Download the Excel template, fill it in, then upload it here.
                </p>
              </div>
              <Button
                className="w-full rounded-none h-12"
                variant="outline"
                onClick={() =>
                  type === "teacher" ? downloadTeacherTemplate() : downloadStudentTemplate()
                }
              >
                <Download className="h-4 w-4 mr-2" />
                Download {type === "teacher" ? "Teacher" : "Student"} Template
              </Button>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                {(type === "teacher" ? TEACHER_REQUIRED : STUDENT_REQUIRED).map((field) => (
                  <li key={field}>
                    <span className="text-foreground">{field}</span>
                    <span className="text-destructive"> *</span>
                  </li>
                ))}
              </ul>
              <Button className="rounded-none w-full" onClick={() => setStep(2)}>
                I have my file ready →
              </Button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">Step 2 — Upload Your File</h3>
                <p className="text-sm text-muted-foreground mt-1">Only .xlsx and .xls files are accepted.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <button
                type="button"
                className="w-full border border-dashed border-border bg-secondary/30 p-8 text-center hover:bg-secondary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
              >
                {parsing ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Parsing file...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-6 w-6" />
                    <span>Drop your Excel file here or click to browse</span>
                  </div>
                )}
              </button>

              {parseResult ? (
                <div className="space-y-4">
                  {parseResult.errorRows === 0 ? (
                    <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 p-3 text-sm">
                      ✓ {parseResult.validRows} records ready to import
                    </div>
                  ) : parseResult.validRows === 0 ? (
                    <div className="border border-destructive/30 bg-destructive/5 text-destructive p-3 text-sm">
                      All rows have errors. Please fix your file and re-upload.
                    </div>
                  ) : (
                    <div className="border border-gold/40 bg-gold/10 text-foreground p-3 text-sm">
                      {parseResult.validRows} records valid, {parseResult.errorRows} records have errors
                    </div>
                  )}

                  {parseResult.validRows > 0 && parseResult.errorRows > 0 ? (
                    <Tabs defaultValue="valid">
                      <TabsList className="rounded-none w-full">
                        <TabsTrigger value="valid" className="rounded-none flex-1">
                          Valid ({parseResult.validRows})
                        </TabsTrigger>
                        <TabsTrigger value="errors" className="rounded-none flex-1">
                          Errors ({parseResult.errorRows})
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="valid">
                        {renderPreviewTable(type, validOnly.slice(0, 5))}
                      </TabsContent>
                      <TabsContent value="errors">{renderErrorTable(errorOnly)}</TabsContent>
                    </Tabs>
                  ) : parseResult.validRows > 0 ? (
                    renderPreviewTable(type, validOnly.slice(0, 5))
                  ) : (
                    renderErrorTable(errorOnly)
                  )}

                  <div className="flex flex-wrap gap-2">
                    {parseResult.validRows > 0 ? (
                      <Button className="rounded-none" onClick={proceedToReview}>
                        {parseResult.errorRows > 0
                          ? `Continue with valid rows only (${parseResult.validRows} records) →`
                          : "Continue to Review →"}
                      </Button>
                    ) : null}
                    {parseResult.errorRows > 0 ? (
                      <Button
                        variant="outline"
                        className="rounded-none"
                        onClick={() => {
                          setParseResult(null);
                          fileInputRef.current?.click();
                        }}
                      >
                        Fix and re-upload
                      </Button>
                    ) : null}
                    <Button variant="ghost" className="rounded-none" onClick={() => setStep(1)}>
                      ← Back
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">Step 3 — Review & Confirm</h3>
                <Card className="rounded-none border-border mt-3">
                  <CardContent className="p-4 text-sm space-y-1">
                    <p>
                      You are about to create <strong>{validRows.length}</strong> accounts
                    </p>
                    <p className="text-muted-foreground">
                      Role: {type === "teacher" ? "Teacher / Staff" : "Student"}
                    </p>
                    {classSummary ? (
                      <p className="text-muted-foreground">Classes: {classSummary}</p>
                    ) : null}
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground mt-3">
                  Passwords will be auto-generated for each account. You will be able to download the
                  credentials after import.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Generated passwords</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none h-8"
                  onClick={() => setShowAllPasswords((p) => !p)}
                >
                  {showAllPasswords ? "Hide all" : "Show all"}
                </Button>
              </div>

              <div className="max-h-64 overflow-auto border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {type === "teacher" ? (
                        <>
                          <TableHead>Name</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Password</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead>Admission No.</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Password</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validRows.map((row, idx) =>
                      type === "teacher" ? (
                        <TableRow key={idx}>
                          <TableCell>
                            {(row as TeacherRow).firstName} {(row as TeacherRow).lastName}
                          </TableCell>
                          <TableCell>{(row as TeacherRow).username}</TableCell>
                          <TableCell>{(row as TeacherRow).role}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {showAllPasswords
                              ? row._generatedPassword
                              : maskPassword(row._generatedPassword ?? "")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow key={idx}>
                          <TableCell>{(row as StudentRow).admissionNumber}</TableCell>
                          <TableCell>
                            {(row as StudentRow).firstName} {(row as StudentRow).lastName}
                          </TableCell>
                          <TableCell>{(row as StudentRow).className}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {showAllPasswords
                              ? row._generatedPassword
                              : maskPassword(row._generatedPassword ?? "")}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="rounded-none" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button
                  className="rounded-none flex-1"
                  disabled={bulkMutation.isPending}
                  onClick={() => bulkMutation.mutate()}
                >
                  {bulkMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    `Import ${validRows.length} Accounts →`
                  )}
                </Button>
              </div>
            </div>
          ) : null}

          {step === 4 && summary ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-2" />
                {summary.skipped === 0 ? (
                  <p className="font-medium text-lg">Successfully created {summary.created} accounts</p>
                ) : (
                  <p className="font-medium text-lg">
                    {summary.created} created, {summary.skipped} skipped
                  </p>
                )}
              </div>

              {summary.skippedDetails.length > 0 ? (
                <div className="border border-border max-h-32 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.skippedDetails.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.username}</TableCell>
                          <TableCell className="text-muted-foreground">{row.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}

              {credentials.length > 0 ? (
                <div className="max-h-48 overflow-auto border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {type === "teacher" ? (
                          <>
                            <TableHead>Name</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Password</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead>Admission No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Password</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {credentials.map((c, i) => (
                        <TableRow key={i}>
                          {type === "teacher" ? (
                            <>
                              <TableCell>{c.name}</TableCell>
                              <TableCell>{c.username}</TableCell>
                              <TableCell className="font-mono text-xs">{c.password}</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{c.username}</TableCell>
                              <TableCell>{c.name}</TableCell>
                              <TableCell>{c.className}</TableCell>
                              <TableCell className="font-mono text-xs">{c.password}</TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Button className="rounded-none" variant="outline" onClick={downloadCredentials}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Credentials as Excel
                </Button>
                <Button className="rounded-none" onClick={() => handleOpenChange(false)}>
                  Done
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function renderPreviewTable(type: "teacher" | "student", rows: Array<TeacherRow | StudentRow>) {
  return (
    <div className="border border-border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {type === "teacher" ? (
              <>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
              </>
            ) : (
              <>
                <TableHead>Admission No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Academic Year</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) =>
            type === "teacher" ? (
              <TableRow key={i}>
                <TableCell>{(row as TeacherRow).firstName}</TableCell>
                <TableCell>{(row as TeacherRow).lastName}</TableCell>
                <TableCell>{(row as TeacherRow).username}</TableCell>
                <TableCell>{(row as TeacherRow).role}</TableCell>
              </TableRow>
            ) : (
              <TableRow key={i}>
                <TableCell>{(row as StudentRow).admissionNumber}</TableCell>
                <TableCell>
                  {(row as StudentRow).firstName} {(row as StudentRow).lastName}
                </TableCell>
                <TableCell>{(row as StudentRow).className}</TableCell>
                <TableCell>{(row as StudentRow).academicYear}</TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function renderErrorTable(rows: Array<TeacherRow | StudentRow>) {
  return (
    <div className="border border-border max-h-48 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Row #</TableHead>
            <TableHead>Errors</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row._rowNumber}</TableCell>
              <TableCell className="text-destructive text-sm">{row._errors.join("; ")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
