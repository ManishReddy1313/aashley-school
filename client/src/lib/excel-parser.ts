import * as XLSX from "xlsx";

const TEACHER_ROLES = ["class_teacher", "subject_teacher", "admissions_officer", "admin_staff"] as const;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
const GENDERS = ["male", "female", "other"] as const;

export interface TeacherRow {
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
  email?: string;
  role: string;
  _rowNumber: number;
  _errors: string[];
  _status: "valid" | "error";
  _generatedPassword?: string;
}

export interface StudentRow {
  admissionNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
  className: string;
  academicYear: string;
  rollNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  _rowNumber: number;
  _errors: string[];
  _status: "valid" | "error";
  _classId?: string;
  _generatedPassword?: string;
}

export interface ParseResult<T> {
  rows: T[];
  totalRows: number;
  validRows: number;
  errorRows: number;
}

export function generatePassword(admissionNumber?: string): string {
  if (admissionNumber && admissionNumber.trim()) {
    const base = admissionNumber.trim().slice(0, 6);
    const random = String(Math.floor(1000 + Math.random() * 9000));
    return `${base}@${random}`;
  }
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function cellStr(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function isEmptyRow(values: string[]): boolean {
  return values.every((v) => !v);
}

function parseAcademicYear(value: string): boolean {
  return /^\d{4}-\d{2}$/.test(value);
}

function parseDateOfBirth(value: string): { valid: boolean; iso?: string } {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return { valid: false };
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { valid: false };
  }
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { valid: true, iso };
}

function normalizeGender(value: string): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower === "male") return "Male";
  if (lower === "female") return "Female";
  if (lower === "other") return "Other";
  return undefined;
}

function formatClassLabel(name: string, section: string | null | undefined): string {
  const trimmedSection = (section ?? "").trim();
  if (!trimmedSection) return name.trim();
  return `${name.trim()} - ${trimmedSection}`;
}

function resolveClassId(
  className: string,
  availableClasses: Array<{ id: string; name: string; section: string | null }>,
): string | undefined {
  const normalized = className.trim().toLowerCase();
  for (const cls of availableClasses) {
    const label = formatClassLabel(cls.name, cls.section).toLowerCase();
    const nameOnly = cls.name.trim().toLowerCase();
    if (label === normalized || nameOnly === normalized) {
      return cls.id;
    }
  }
  return undefined;
}

function readSheetRows(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" }) as string[][];
        resolve(rows.map((row) => row.map((cell) => cellStr(cell))));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export async function parseTeacherExcel(file: File): Promise<ParseResult<TeacherRow>> {
  const rawRows = await readSheetRows(file);
  if (rawRows.length < 2) {
    return { rows: [], totalRows: 0, validRows: 0, errorRows: 0 };
  }

  const dataRows = rawRows.slice(1);
  const rows: TeacherRow[] = [];

  dataRows.forEach((cells, index) => {
    const rowNumber = index + 2;
    const values = [
      cellStr(cells[0]),
      cellStr(cells[1]),
      cellStr(cells[2]),
      cellStr(cells[3]),
      cellStr(cells[4]),
      cellStr(cells[5]),
    ];
    if (isEmptyRow(values)) return;

    const errors: string[] = [];
    const firstName = values[0];
    const lastName = values[1];
    const username = values[2];
    const phone = values[3] || undefined;
    const email = values[4] || undefined;
    const role = values[5].toLowerCase();

    if (!firstName) errors.push("First Name is required");
    if (!lastName) errors.push("Last Name is required");
    if (!username) errors.push("Username is required");
    else if (/\s/.test(username)) errors.push("Username cannot contain spaces");
    if (!role) errors.push("Role is required");
    else if (!TEACHER_ROLES.includes(role as (typeof TEACHER_ROLES)[number])) {
      errors.push(`Role must be one of: ${TEACHER_ROLES.join(", ")}`);
    }
    if (email && !email.includes("@")) errors.push("Email must contain @");
    if (phone && !/^\d{10}$/.test(phone)) errors.push("Phone must be 10 digits");

    rows.push({
      firstName,
      lastName,
      username,
      phone,
      email,
      role,
      _rowNumber: rowNumber,
      _errors: errors,
      _status: errors.length === 0 ? "valid" : "error",
    });
  });

  const validRows = rows.filter((r) => r._status === "valid").length;
  return {
    rows,
    totalRows: rows.length,
    validRows,
    errorRows: rows.length - validRows,
  };
}

export async function parseStudentExcel(
  file: File,
  availableClasses: Array<{ id: string; name: string; section: string | null }>,
): Promise<ParseResult<StudentRow>> {
  const rawRows = await readSheetRows(file);
  if (rawRows.length < 2) {
    return { rows: [], totalRows: 0, validRows: 0, errorRows: 0 };
  }

  const dataRows = rawRows.slice(1);
  const rows: StudentRow[] = [];
  const admissionCounts = new Map<string, number[]>();

  dataRows.forEach((cells, index) => {
    const rowNumber = index + 2;
    const values = [
      cellStr(cells[0]),
      cellStr(cells[1]),
      cellStr(cells[2]),
      cellStr(cells[3]),
      cellStr(cells[4]),
      cellStr(cells[5]),
      cellStr(cells[6]),
      cellStr(cells[7]),
      cellStr(cells[8]),
      cellStr(cells[9]),
    ];
    if (isEmptyRow(values)) return;

    const admissionNumber = values[0];
    const firstName = values[1];
    const lastName = values[2];
    const phone = values[3] || undefined;
    const className = values[4];
    const academicYear = values[5];
    const rollNumber = values[6] || undefined;
    const dateOfBirthRaw = values[7] || undefined;
    const genderRaw = values[8] || undefined;
    const bloodGroupRaw = values[9] || undefined;

    const errors: string[] = [];

    if (!admissionNumber) errors.push("Admission Number is required");
    else if (/\s/.test(admissionNumber)) errors.push("Admission Number cannot contain spaces");

    if (!firstName) errors.push("First Name is required");
    if (!lastName) errors.push("Last Name is required");

    if (!className) errors.push("Class Name is required");
    else {
      const classId = resolveClassId(className, availableClasses);
      if (!classId) errors.push(`Class '${className}' not found in system`);
    }

    if (!academicYear) errors.push("Academic Year is required");
    else if (!parseAcademicYear(academicYear)) {
      errors.push("Academic Year must be in YYYY-YY format (e.g. 2026-27)");
    }

    let parsedDob: string | undefined;
    if (dateOfBirthRaw) {
      const dob = parseDateOfBirth(dateOfBirthRaw);
      if (!dob.valid) errors.push("Date of Birth must be dd/mm/yyyy");
      else parsedDob = dob.iso;
    }

    let parsedGender: string | undefined;
    if (genderRaw) {
      parsedGender = normalizeGender(genderRaw);
      if (!parsedGender) errors.push("Gender must be Male, Female, or Other");
    }

    if (bloodGroupRaw) {
      const normalizedBg = bloodGroupRaw.toUpperCase().replace(/\s/g, "");
      const match = BLOOD_GROUPS.find((bg) => bg === normalizedBg);
      if (!match) errors.push("Blood Group must be one of: A+, A-, B+, B-, O+, O-, AB+, AB-");
    }

    if (phone && !/^\d{10}$/.test(phone)) errors.push("Phone must be 10 digits");

    const classId = className ? resolveClassId(className, availableClasses) : undefined;

    const row: StudentRow = {
      admissionNumber,
      firstName,
      lastName,
      phone,
      className,
      academicYear,
      rollNumber,
      dateOfBirth: parsedDob ?? dateOfBirthRaw,
      gender: parsedGender ?? genderRaw,
      bloodGroup: bloodGroupRaw ? bloodGroupRaw.toUpperCase().replace(/\s/g, "") : undefined,
      _rowNumber: rowNumber,
      _errors: errors,
      _status: errors.length === 0 ? "valid" : "error",
      _classId: classId,
    };

    rows.push(row);

    if (admissionNumber) {
      const key = admissionNumber.toLowerCase();
      const existing = admissionCounts.get(key) ?? [];
      existing.push(rows.length - 1);
      admissionCounts.set(key, existing);
    }
  });

  for (const indices of Array.from(admissionCounts.values())) {
    if (indices.length > 1) {
      for (const idx of indices) {
        const row = rows[idx];
        if (!row._errors.includes("Duplicate admission number in file")) {
          row._errors.push("Duplicate admission number in file");
        }
        row._status = "error";
      }
    }
  }

  const validRows = rows.filter((r) => r._status === "valid").length;
  return {
    rows,
    totalRows: rows.length,
    validRows,
    errorRows: rows.length - validRows,
  };
}

/** Mask password for preview: first 5 chars + bullets */
export function maskPassword(password: string): string {
  if (password.length <= 5) return "●".repeat(password.length);
  return `${password.slice(0, 5)}${"●".repeat(Math.min(password.length - 5, 4))}`;
}
