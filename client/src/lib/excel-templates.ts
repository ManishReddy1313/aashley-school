import * as XLSX from "xlsx";

const TEACHER_HEADERS = [
  "First Name*",
  "Last Name*",
  "Username*",
  "Phone",
  "Email",
  "Role*",
];

const TEACHER_EXAMPLE = ["Priya", "Sharma", "priya.sharma", "9876543210", "priya@school.in", "class_teacher"];

const STUDENT_HEADERS = [
  "Admission Number*",
  "First Name*",
  "Last Name*",
  "Phone",
  "Class Name*",
  "Academic Year*",
  "Roll Number",
  "Date of Birth (dd/mm/yyyy format)",
  "Gender (Male / Female / Other)",
  "Blood Group (A+, A-, B+, B-, O+, O-, AB+, AB-)",
];

const STUDENT_EXAMPLE = [
  "ASH-2026-001",
  "Arjun",
  "Kumar",
  "9876543210",
  "Grade 8 - A",
  "2026-27",
  "12",
  "15/03/2010",
  "Male",
  "O+",
];

function buildSheet(headers: string[], example: string[]) {
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);
  return ws;
}

export function downloadTeacherTemplate(): void {
  const wb = XLSX.utils.book_new();
  const ws = buildSheet(TEACHER_HEADERS, TEACHER_EXAMPLE);
  XLSX.utils.book_append_sheet(wb, ws, "Teachers");
  XLSX.writeFile(wb, "teacher-upload-template.xlsx");
}

export function downloadStudentTemplate(): void {
  const wb = XLSX.utils.book_new();
  const ws = buildSheet(STUDENT_HEADERS, STUDENT_EXAMPLE);
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  XLSX.writeFile(wb, "student-upload-template.xlsx");
}
