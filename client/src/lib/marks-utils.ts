export function computePercent(marks: number, maxMarks: number): number {
  if (!maxMarks || maxMarks <= 0) return 0;
  return Math.round((marks / maxMarks) * 100);
}

export function computeGrade(marks: number, maxMarks: number): string {
  const percent = computePercent(marks, maxMarks);
  if (percent >= 90) return "A+";
  if (percent >= 80) return "A";
  if (percent >= 70) return "B+";
  if (percent >= 60) return "B";
  if (percent >= 50) return "C";
  return "F";
}

export function gradeColorClass(grade: string): string {
  if (grade === "A+" || grade === "A") return "text-emerald-700 bg-emerald-50";
  if (grade === "B+" || grade === "B") return "text-primary bg-primary/5";
  if (grade === "C") return "text-gold-dark bg-gold/10";
  return "text-destructive bg-destructive/5";
}
